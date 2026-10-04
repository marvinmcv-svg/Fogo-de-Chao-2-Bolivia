"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { prefersReducedMotion, registerGsap, smooth } from "@/lib/motion";

/** Aurora palettes per section tone (rgb() so GSAP can interpolate the custom properties). */
const tones = {
  ember: ["rgb(232, 86, 28)", "rgb(140, 36, 20)", "rgb(59, 13, 11)"],
  garnet: ["rgb(150, 40, 28)", "rgb(232, 86, 28)", "rgb(42, 9, 7)"],
  amber: ["rgb(240, 160, 75)", "rgb(232, 86, 28)", "rgb(110, 24, 16)"],
} as const;

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Global motion controller.
 *  - Lenis smooth scroll bound to GSAP's ticker (off for reduced motion).
 *  - Scroll-triggered reveals for [data-split], [data-fade], [data-mask], [data-scrub], [data-parallax].
 *  - Hero depth on scroll, magnetic buttons.
 *  Re-armed on every route change; if a page curtain is covering the screen, entrances wait for `curtain:open`.
 */
export function Motion() {
  const pathname = usePathname();

  // Smooth scroll, once.
  useEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    smooth.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      smooth.lenis = null;
    };
  }, []);

  // Entrances, per route.
  useIsoLayoutEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();
    window.scrollTo(0, 0);
    smooth.lenis?.scrollTo(0, { immediate: true });
    if (prefersReducedMotion()) return;

    let ctx: ReturnType<typeof gsap.context> | undefined;
    const cleanups: Array<() => void> = [];

    const build = () => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-split]:not([data-intro])").forEach((el) => {
          const spans = el.querySelectorAll<HTMLElement>(".w > span");
          const delay = Number(el.dataset.delay || 0);
          ScrollTrigger.create({
            trigger: el, start: "top 90%", once: true,
            onEnter: () => {
              el.classList.add("is-in");
              gsap.fromTo(spans, { yPercent: 112 }, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.05, delay });
            },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-fade]:not([data-intro])").forEach((el) => {
          const delay = Number(el.dataset.delay || 0);
          ScrollTrigger.create({
            trigger: el, start: "top 92%", once: true,
            onEnter: () => {
              el.classList.add("is-in");
              gsap.fromTo(el, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out", delay, clearProps: "transform" });
            },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-mask]").forEach((el) => {
          const media = el.querySelector<HTMLElement>("img, video");
          const delay = Number(el.dataset.delay || 0);
          ScrollTrigger.create({
            trigger: el, start: "top 90%", once: true,
            onEnter: () => {
              el.classList.add("is-in");
              gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "expo.inOut", delay });
              if (media) gsap.fromTo(media, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "expo.out", delay });
            },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-scrub]").forEach((el) => {
          gsap.fromTo(el.querySelectorAll(".sw"), { opacity: (_i: number, w: Element) => (w.closest("em") ? 0.75 : 0.42) }, {
            opacity: 1, ease: "none", stagger: 0.12,
            scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 48%", scrub: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = Number(el.dataset.parallax || 8);
          const target = el.querySelector<HTMLElement>("img, video") ?? el;
          gsap.fromTo(target, { yPercent: -amount }, {
            yPercent: amount, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });

        // Hero: the film pushes in and the copy drifts away as you leave.
        const hero = document.querySelector<HTMLElement>("[data-hero]");
        if (hero) {
          const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
          gsap.to(hero.querySelector(".hero__media"), { scale: 1.18, yPercent: 10, ease: "none", scrollTrigger: st });
          gsap.to(hero.querySelector(".hero__inner"), { yPercent: -9, opacity: 0.15, ease: "none", scrollTrigger: st });
        }

        // Atmosphere: the fixed aurora re-tints as each toned section crosses the middle of the screen.
        const aurora = document.querySelector<HTMLElement>(".aurora");
        if (aurora) {
          gsap.utils.toArray<HTMLElement>("[data-tone]").forEach((el) => {
            const tone = tones[el.dataset.tone as keyof typeof tones];
            if (!tone) return;
            ScrollTrigger.create({
              trigger: el, start: "top 55%", end: "bottom 45%",
              onToggle: (self) => { if (self.isActive) gsap.to(aurora, { "--a1": tone[0], "--a2": tone[1], "--a3": tone[2], duration: 1.6, ease: "power2.inOut", overwrite: "auto" }); },
            });
          });
        }

        // Sticky stack (desktop): each panel recedes and darkens while the next slides over it.
        if (window.matchMedia("(min-width: 62rem)").matches) {
          const cards = gsap.utils.toArray<HTMLElement>("[data-stack]");
          cards.slice(0, -1).forEach((card, i) => {
            const trigger = cards[i + 1];
            const st = { trigger, start: "top 88%", end: "top 14%", scrub: true };
            gsap.to(card, { scale: 0.93, ease: "none", scrollTrigger: st });
            gsap.to(card.querySelector(".stack__shade"), { opacity: 0.72, ease: "none", scrollTrigger: st });
          });
        }

        // Ritual: the vertical line draws itself down the steps.
        gsap.utils.toArray<HTMLElement>("[data-progress]").forEach((el) => {
          ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 60%", scrub: true, onUpdate: (self) => el.style.setProperty("--p", self.progress.toFixed(3)) });
        });
      });
    };

    // Magnetic buttons: fine pointers only.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
        const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          x((e.clientX - (r.left + r.width / 2)) * 0.28);
          y((e.clientY - (r.top + r.height / 2)) * 0.4);
        };
        const reset = () => { x(0); y(0); };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", reset);
        cleanups.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", reset); gsap.set(el, { clearProps: "x,y" }); });
      });
    }

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      // Tilt + spotlight border: cards lean toward the pointer in 3D and a soft light follows it along the edge.
      document.querySelectorAll<HTMLElement>("[data-tilt], .spot").forEach((el) => {
        const tilt = el.hasAttribute("data-tilt");
        const rx = tilt ? gsap.quickTo(el, "rotationX", { duration: 0.7, ease: "power3" }) : null;
        const ry = tilt ? gsap.quickTo(el, "rotationY", { duration: 0.7, ease: "power3" }) : null;
        if (tilt) gsap.set(el, { transformPerspective: 900 });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
          el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
          rx?.((0.5 - py) * 9);
          ry?.((px - 0.5) * 11);
        };
        const leave = () => { rx?.(0); ry?.(0); };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); gsap.set(el, { clearProps: "transform" }); });
      });

      // Hero depth: the headline turns a few degrees in 3D and the fire gradient drifts the other way.
      const heroEl = document.querySelector<HTMLElement>("[data-hero]");
      const title = heroEl?.querySelector<HTMLElement>(".hero__title");
      const glow = heroEl?.querySelector<HTMLElement>(".hero__glow");
      if (heroEl && title) {
        gsap.set(title, { transformPerspective: 900, transformOrigin: "0% 60%" });
        const ry = gsap.quickTo(title, "rotationY", { duration: 1.1, ease: "power3" });
        const rx = gsap.quickTo(title, "rotationX", { duration: 1.1, ease: "power3" });
        const gx = glow ? gsap.quickTo(glow, "x", { duration: 1.6, ease: "power3" }) : null;
        const gy = glow ? gsap.quickTo(glow, "y", { duration: 1.6, ease: "power3" }) : null;
        const move = (e: PointerEvent) => {
          const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
          ry(nx * 7); rx(-ny * 5); gx?.(-nx * 60); gy?.(-ny * 40);
        };
        window.addEventListener("pointermove", move, { passive: true });
        cleanups.push(() => { window.removeEventListener("pointermove", move); gsap.set([title, glow].filter(Boolean), { clearProps: "transform" }); });
      }
    }

    // Text scramble on [data-scramble] links (hover/focus). The original label is restored and exposed via aria-label.
    {
      const glyphs = "!<>-_/[]{}=+*^?#";
      const run = (el: HTMLElement) => {
        const original = el.dataset.label ?? (el.dataset.label = el.textContent ?? "");
        el.setAttribute("aria-label", original);
        const state = { p: 0 };
        gsap.killTweensOf(state);
        gsap.to(state, {
          p: 1, duration: 0.55, ease: "none",
          onUpdate: () => {
            el.textContent = original.split("").map((c, i) => (c === " " || i < state.p * original.length ? c : glyphs[(Math.random() * glyphs.length) | 0])).join("");
          },
          onComplete: () => { el.textContent = original; },
        });
      };
      const onOver = (e: Event) => { const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-scramble]"); if (el) run(el); };
      document.addEventListener("pointerover", onOver, { passive: true });
      document.addEventListener("focusin", onOver);
      cleanups.push(() => { document.removeEventListener("pointerover", onOver); document.removeEventListener("focusin", onOver); });
    }

    if (document.documentElement.dataset.curtain) {
      const onOpen = () => build();
      window.addEventListener("curtain:open", onOpen, { once: true });
      cleanups.push(() => window.removeEventListener("curtain:open", onOpen));
    } else {
      build();
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    return () => {
      window.removeEventListener("load", refresh);
      cleanups.forEach((c) => c());
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
