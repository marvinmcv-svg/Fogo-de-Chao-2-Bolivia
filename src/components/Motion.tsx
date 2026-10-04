"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { prefersReducedMotion, registerGsap, smooth } from "@/lib/motion";

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

  // Smooth scroll — once.
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

  // Entrances — per route.
  useIsoLayoutEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();
    window.scrollTo(0, 0);
    smooth.lenis?.scrollTo(0, { immediate: true });
    if (prefersReducedMotion()) return;

    let ctx: ReturnType<typeof gsap.context> | undefined;
    const cleanups: Array<() => void> = [];

    const build = () => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
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

        gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((el) => {
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
          gsap.fromTo(el.querySelectorAll(".sw"), { opacity: 0.16 }, {
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
