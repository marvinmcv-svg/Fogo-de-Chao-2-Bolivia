"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Hero fire: a domain-warped gradient field (ember, garnet, amber) that breathes with the pointer and scroll,
 * with a GPU point cloud of rising embers on top. One WebGL context, two draw calls.
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

      // Fire field: fbm domain warp mapped through a deep-wine → garnet → ember → amber ramp, strongest at the bottom edge.
      const fire = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uScroll: { value: 0 }, uAspect: { value: 1 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: /* glsl */ `
          precision highp float;
          varying vec2 vUv; uniform float uTime, uScroll, uAspect; uniform vec2 uMouse;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
            return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
          float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.02 + 7.3; a *= 0.5; } return v; }
          void main(){
            vec2 uv = vUv; vec2 p = vec2(uv.x * uAspect, uv.y) * 1.6;
            float t = uTime * 0.08;
            vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
            vec2 r = vec2(fbm(p + 3.0*q + vec2(1.7, 9.2) + t*1.3), fbm(p + 3.0*q + vec2(8.3, 2.8) - t));
            float f = fbm(p + 3.2*r + uMouse * 0.6);
            float rise = smoothstep(1.05, -0.1, uv.y - uScroll * 0.35);
            float heat = clamp(f * 1.35 * (0.35 + rise * 0.95), 0.0, 1.0);
            vec3 wine = vec3(0.23, 0.05, 0.04), garnet = vec3(0.55, 0.14, 0.08), ember = vec3(0.91, 0.34, 0.11), amber = vec3(1.0, 0.63, 0.29);
            vec3 col = mix(wine, garnet, smoothstep(0.1, 0.45, heat));
            col = mix(col, ember, smoothstep(0.4, 0.75, heat));
            col = mix(col, amber, smoothstep(0.72, 1.0, heat));
            float vig = smoothstep(1.25, 0.25, length((uv - vec2(0.5 + uMouse.x*0.1, 0.0)) * vec2(1.0, 1.15)));
            float a = clamp(heat * vig * 0.42, 0.0, 0.4);
            gl_FragColor = vec4(col, a);
          }`,
      });
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fire);
      quad.frustumCulled = false;
      quad.renderOrder = -1;
      scene.add(quad);

      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        const aspect = w / h;
        cam.left = -aspect; cam.right = aspect; cam.updateProjectionMatrix();
        mat.uniforms.uAspect.value = aspect;
        fire.uniforms.uAspect.value = aspect;
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
        fire.uniforms.uTime.value += dt;
        fire.uniforms.uMouse.value.set(mouse.x, mouse.y);
        fire.uniforms.uScroll.value = Math.min(scrollY / Math.max(innerHeight, 1), 1.2);
        renderer.render(scene, cam);
      };
      raf = requestAnimationFrame(frame);
      requestAnimationFrame(() => canvas.classList.add("is-ready"));

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect(); io.disconnect();
        window.removeEventListener("pointermove", onMove);
        geo.dispose(); mat.dispose(); fire.dispose(); quad.geometry.dispose(); renderer.dispose();
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
