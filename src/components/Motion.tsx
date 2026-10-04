"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { prefersReducedMotion, registerGsap, smooth } from "@/lib/motion";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Global motion controller.
 *  - Lenis smooth scroll bound to GSAP's ticker (disabled for reduced motion / coarse pointers keep native momentum).
 *  - Scroll-triggered reveals for [data-split], [data-fade], [data-mask] elements, re-armed on every route change.
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

  // Reveals — per route.
  useIsoLayoutEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();
    window.scrollTo(0, 0);
    smooth.lenis?.scrollTo(0, { immediate: true });
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        const spans = el.querySelectorAll<HTMLElement>(".w > span");
        const delay = Number(el.dataset.delay || 0);
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => {
            el.classList.add("is-in");
            gsap.fromTo(spans, { yPercent: 112 }, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.05, delay });
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((el) => {
        const delay = Number(el.dataset.delay || 0);
        ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          once: true,
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
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => {
            el.classList.add("is-in");
            gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "expo.inOut", delay });
            if (media) gsap.fromTo(media, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "expo.out", delay });
          },
        });
      });

      // Subtle parallax for media inside [data-parallax]
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax || 8);
        const target = el.querySelector<HTMLElement>("img, video") ?? el;
        gsap.fromTo(target, { yPercent: -amount }, {
          yPercent: amount,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
