"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Rising embers: a single GPU point cloud behind the hero copy.
 * Only runs on capable desktops (wide viewport, fine pointer, ≥4 cores, no Save-Data, no reduced motion),
 * pauses when off-screen or the tab is hidden, and `three` is fetched lazily so it never blocks first paint.
 */
export function Embers() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const capable =
      window.matchMedia("(min-width: 62rem) and (pointer: fine)").matches &&
      !prefersReducedMotion() &&
      !nav.connection?.saveData &&
      (nav.hardwareConcurrency ?? 4) >= 4 &&
      (nav.deviceMemory ?? 8) >= 4;
    if (!capable) return;

    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      const THREE = await import("three");
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      } catch {
        return; // no WebGL: the film and scrim carry the hero on their own
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.className = "embers__canvas";
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
      cam.position.z = 5;

      const N = 320;
      const pos = new Float32Array(N * 3), seed = new Float32Array(N), rnd = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        pos[i * 3] = Math.random() * 2 - 1;
        seed[i] = Math.random();
        rnd.set([Math.random(), Math.random(), Math.random()], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 3));

      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPx: { value: 14 }, uMouse: { value: new THREE.Vector2() }, uAspect: { value: 1 } },
        vertexShader: /* glsl */ `
          uniform float uTime, uPx, uAspect; uniform vec2 uMouse;
          attribute float aSeed; attribute vec3 aRand;
          varying float vA; varying float vH;
          void main() {
            float life = fract(uTime * (0.035 + aRand.x * 0.07) + aSeed);
            vec3 p = position;
            p.x *= uAspect * 1.05;
            p.y = -1.1 + life * 2.4;
            p.x += sin(uTime * (0.4 + aRand.y) + aSeed * 40.0) * 0.07 * (0.3 + life * 1.4) + (life * 0.3) * (aRand.z - 0.5);
            p.x += uMouse.x * 0.05 * (0.3 + aRand.x);
            p.y += uMouse.y * 0.03 * (0.3 + aRand.y);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            float flick = 0.55 + 0.45 * sin(uTime * (3.0 + aRand.y * 6.0) + aSeed * 20.0);
            vA = smoothstep(0.0, 0.1, life) * (1.0 - smoothstep(0.5, 1.0, life)) * flick;
            vH = life;
            gl_PointSize = uPx * (0.4 + aRand.x * 1.1) * (1.0 - life * 0.45);
          }`,
        fragmentShader: /* glsl */ `
          varying float vA; varying float vH;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * vA;
            vec3 c = mix(vec3(1.0, 0.62, 0.22), vec3(0.91, 0.2, 0.05), vH);
            gl_FragColor = vec4(c, a * 0.9);
          }`,
      });
      scene.add(new THREE.Points(geo, mat));

      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        const aspect = w / h;
        cam.left = -aspect; cam.right = aspect; cam.updateProjectionMatrix();
        mat.uniforms.uAspect.value = aspect;
        mat.uniforms.uPx.value = 14 * renderer.getPixelRatio() * (h / 900);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      const mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => { target.x = e.clientX / innerWidth - 0.5; target.y = -(e.clientY / innerHeight - 0.5); };
      window.addEventListener("pointermove", onMove, { passive: true });

      let visible = true, raf = 0, last = performance.now();
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
      io.observe(el);
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) { last = now; return; }
        const dt = Math.min((now - last) / 1000, 0.05); last = now;
        mat.uniforms.uTime.value += dt;
        mouse.x += (target.x - mouse.x) * 0.04; mouse.y += (target.y - mouse.y) * 0.04;
        mat.uniforms.uMouse.value.set(mouse.x, mouse.y);
        renderer.render(scene, cam);
      };
      raf = requestAnimationFrame(frame);
      requestAnimationFrame(() => canvas.classList.add("is-ready"));

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect(); io.disconnect();
        window.removeEventListener("pointermove", onMove);
        geo.dispose(); mat.dispose(); renderer.dispose();
        canvas.remove();
      };
    };

    // Don't compete with LCP: wait until the browser is idle (Safari lacks requestIdleCallback → timeout fallback).
    const hasIdle = "requestIdleCallback" in window;
    const id = hasIdle ? window.requestIdleCallback(() => void start(), { timeout: 2500 }) : window.setTimeout(() => void start(), 1200);
    return () => {
      disposed = true;
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      cleanup();
    };
  }, []);

  return <div ref={host} className="embers" aria-hidden="true" />;
}
