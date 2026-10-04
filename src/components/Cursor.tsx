"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** Trailing ring for fine pointers only. The native cursor is never hidden. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || prefersReducedMotion()) return;
    const el = ring.current!;
    let tx = -100, ty = -100, x = tx, y = ty, raf = 0, seen = false;

    const move = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { seen = true; x = tx; y = ty; el.classList.add("is-on"); }
    };
    const over = (e: Event) => {
      const t = (e.target as Element | null)?.closest?.("a, button, summary, input, select, textarea, [data-cursor]") as HTMLElement | null;
      el.classList.toggle("is-link", !!t);
      const text = t?.dataset.cursor ?? "";
      el.classList.toggle("has-label", !!text);
      if (label.current) label.current.textContent = text;
    };
    const leave = () => el.classList.remove("is-on");
    const tick = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={ring} className="cursor" aria-hidden="true">
      <span ref={label} className="cursor__label" />
    </div>
  );
}
