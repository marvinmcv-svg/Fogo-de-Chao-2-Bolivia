"use client";

import { useEffect, useRef } from "react";
import { reducedMotionQuery } from "@/lib/motion";

type Props = { src: string; className?: string };

/**
 * Decorative looping film that costs nothing until it matters: no bytes are requested until the element is
 * within ~300px of the viewport, it pauses when scrolled away, and it never loads under reduced motion or Save-Data.
 * The poster/image underneath (rendered by the caller) stays as the fallback.
 */
export function LazyVideo({ src, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (window.matchMedia(reducedMotionQuery).matches || conn?.saveData || conn?.effectiveType === "2g") return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.getAttribute("src")) { v.src = src; v.load(); }
          v.play().catch(() => {}); // autoplay can be refused (battery saver); the poster remains
        } else {
          v.pause();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return <video ref={ref} className={className} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />;
}
