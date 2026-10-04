"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";

/**
 * The rodizio token as a real 3D object: a physically-shaded coin lit by an image-based environment,
 * flipped between green (sim) and red (não) as the ritual steps change, nudged by the pointer, spun by scroll.
 * `three` loads lazily; if WebGL is unavailable the CSS token in <Ritual /> stays as the fallback.
 */
export function Token3D({ nao, onReady }: { nao: boolean; onReady: (ready: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ flip: (toNao: boolean) => void } | null>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = host.current;
    if (!el || prefersReducedMotion()) return;
    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      const [THREE, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/environments/RoomEnvironment.js"),
      ]);
      if (disposed) return;
      const { gsap, ScrollTrigger } = registerGsap();

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "default" });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      const canvas = renderer.domElement;
      canvas.className = "token3d__canvas";
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new RoomEnvironment();
      scene.environment = pmrem.fromScene(envScene, 0.04).texture;
      scene.environmentIntensity = 0.55; // RoomEnvironment is bright; keep the printed faces readable, not washed out
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
      camera.position.set(0, 0, 7.4);

      // Faces are painted on canvases using the site's own display face.
      const family = getComputedStyle(document.querySelector(".token__face strong") ?? document.body).fontFamily;
      await document.fonts.ready;
      if (disposed) return;
      const face = (top: string, bottom: string, label: string, sub: string) => {
        const c = document.createElement("canvas");
        c.width = c.height = 1024;
        const g = c.getContext("2d")!;
        const rg = g.createRadialGradient(400, 330, 40, 512, 512, 560);
        rg.addColorStop(0, top); rg.addColorStop(1, bottom);
        g.fillStyle = rg; g.fillRect(0, 0, 1024, 1024);
        g.strokeStyle = "rgba(255,244,228,0.55)"; g.lineWidth = 6;
        g.beginPath(); g.arc(512, 512, 452, 0, Math.PI * 2); g.stroke();
        g.strokeStyle = "rgba(255,244,228,0.22)"; g.lineWidth = 2;
        g.beginPath(); g.arc(512, 512, 420, 0, Math.PI * 2); g.stroke();
        g.fillStyle = "rgba(255,244,228,0.92)";
        g.textAlign = "center"; g.textBaseline = "middle";
        g.font = `600 58px ${getComputedStyle(document.body).fontFamily}`;
        if ("letterSpacing" in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "22px";
        g.fillText(sub.toUpperCase(), 512 + 11, 380);
        if ("letterSpacing" in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
        g.font = `italic 400 190px ${family}`;
        g.fillText(label, 512, 560);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return t;
      };
      const texSim = face("#3f9d68", "#1d5a38", "Sim", "Por favor");
      const texNao = face("#c8362b", "#6e140f", "Não", "Obrigado");
      const R = 1.5, T = 0.2;
      const metal = (color: number) => new THREE.MeshPhysicalMaterial({ color, metalness: 0.85, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.3 });
      const faceMat = (map: InstanceType<typeof THREE.CanvasTexture>) => new THREE.MeshPhysicalMaterial({ map, metalness: 0.2, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.25 });
      // Faces are separate circular plates (a plate's UVs are upright by construction, unlike cylinder caps); the back one is turned around.
      const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, T, 128, 1), metal(0xb98a52));
      body.rotation.x = Math.PI / 2; // cylinder axis → z
      const plate = (map: InstanceType<typeof THREE.CanvasTexture>, z: number, flip: boolean) => {
        const m = new THREE.Mesh(new THREE.CircleGeometry(R - 0.06, 128), faceMat(map));
        m.position.z = z;
        if (flip) m.rotation.y = Math.PI;
        return m;
      };
      const rim = (z: number) => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(R - 0.02, 0.045, 24, 160), metal(0xd9ad72));
        m.position.z = z; return m;
      };
      const coin = new THREE.Group();
      coin.add(body, plate(texSim, T / 2 + 0.002, false), plate(texNao, -T / 2 - 0.002, true), rim(T / 2), rim(-T / 2));
      scene.add(coin);

      const warm = new THREE.DirectionalLight(0xffb27a, 2.2);
      warm.position.set(-3, 3.5, 4);
      const rimLight = new THREE.PointLight(0xe8561c, 18, 14);
      rimLight.position.set(3.2, -2.4, 2);
      scene.add(warm, rimLight);

      const s = { flip: 0, lift: 0, scroll: 0, tx: 0, ty: 0, t: 0 };
      api.current = {
        flip(toNao: boolean) {
          gsap.to(s, { flip: toNao ? 1 : 0, duration: 1.5, ease: "elastic.out(1, 0.6)", overwrite: "auto" });
          gsap.fromTo(s, { lift: 0 }, { lift: 1, duration: 0.45, ease: "power2.out", yoyo: true, repeat: 1 });
        },
      };

      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      const target = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => { target.x = (e.clientX / innerWidth - 0.5) * 2; target.y = (e.clientY / innerHeight - 0.5) * 2; };
      window.addEventListener("pointermove", onMove, { passive: true });

      const section = el.closest<HTMLElement>(".ritual");
      const st = section
        ? ScrollTrigger.create({ trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6, onUpdate: (self) => { s.scroll = self.progress; } })
        : null;

      let visible = true, raf = 0, last = performance.now();
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
      io.observe(el);
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) { last = now; return; }
        s.t += Math.min((now - last) / 1000, 0.05); last = now;
        s.tx += (target.x - s.tx) * 0.06; s.ty += (target.y - s.ty) * 0.06;
        coin.rotation.y = s.flip * Math.PI + s.tx * 0.38 + Math.sin(s.t * 0.7) * 0.1;
        coin.rotation.x = s.ty * 0.25 + Math.sin(s.t * 0.55) * 0.06 + (s.scroll - 0.5) * 0.9;
        coin.rotation.z = Math.sin(s.t * 0.4) * 0.04;
        coin.position.y = Math.sin(s.t * 0.9) * 0.07;
        coin.position.z = s.lift * 0.9;
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);
      requestAnimationFrame(() => { canvas.classList.add("is-ready"); onReady(true); });

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect(); io.disconnect(); st?.kill();
        window.removeEventListener("pointermove", onMove);
        gsap.killTweensOf(s);
        scene.traverse((o) => {
          const m = o as InstanceType<typeof THREE.Mesh>;
          if (m.geometry) m.geometry.dispose();
          const mat = m.material as InstanceType<typeof THREE.Material> | InstanceType<typeof THREE.Material>[] | undefined;
          (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
        });
        texSim.dispose(); texNao.dispose(); pmrem.dispose(); renderer.dispose();
        canvas.remove();
        api.current = null;
        onReady(false);
      };
    };

    const hasIdle = "requestIdleCallback" in window;
    const id = hasIdle ? window.requestIdleCallback(() => void start(), { timeout: 1800 }) : window.setTimeout(() => void start(), 600);
    return () => {
      disposed = true;
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      cleanup();
    };
  }, [onReady]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    api.current?.flip(nao);
  }, [nao]);

  return <div ref={host} className="token3d" aria-hidden="true" />;
}
