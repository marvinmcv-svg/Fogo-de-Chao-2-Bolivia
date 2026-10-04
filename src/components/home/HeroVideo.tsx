"use client";

import { useEffect, useRef } from "react";
import { reducedMotionQuery } from "@/lib/motion";

/**
 * The hero film starts only after the page has loaded and the browser is idle, so it never competes with the LCP
 * image/text. The poster underneath carries the first paint; the film fades in once it is actually playing.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (window.matchMedia(reducedMotionQuery).matches || conn?.saveData || conn?.effectiveType === "2g") return;

    let idleId = 0, timer = 0;
    const start = () => {
      v.src = "/media/video/hero.mp4";
      v.load();
      v.play().catch(() => {});
    };
    const arm = () => {
      const w: Window = window; // widened: `in` narrowing would otherwise make the else branch `never`
      if (typeof w.requestIdleCallback === "function") idleId = w.requestIdleCallback(start, { timeout: 3000 });
      else timer = w.setTimeout(start, 1500);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    return () => {
      window.removeEventListener("load", arm);
      if (idleId) window.cancelIdleCallback(idleId);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="hero__video"
      muted
      loop
      playsInline
      preload="none"
      onPlaying={() => ref.current?.classList.add("is-playing")}
    />
  );
}
