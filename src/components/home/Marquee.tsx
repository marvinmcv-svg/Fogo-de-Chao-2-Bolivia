"use client";

import { useLayoutEffect, useRef } from "react";
import { cuts } from "@/lib/site";
import { registerGsap } from "@/lib/motion";

const words = [...cuts.map((c) => c.name), "Market Table", "Bar Fogo"];

/**
 * The page's single marquee. It drifts on its own and the scroll speed pushes it: faster scrolling speeds it up
 * and skews the type, reversing direction when the visitor scrolls back up. Static, wrapped text under reduced motion.
 */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const t = track.current!;
      const loop = gsap.to(t, { xPercent: -50, duration: 46, ease: "none", repeat: -1 });
      const skew = gsap.quickTo(t, "skewX", { duration: 0.5, ease: "power3" });
      let dir = 1, ts = 1;
      const st = ScrollTrigger.create({
        trigger: root.current, start: "top bottom", end: "bottom top",
        onUpdate: (self) => { dir = self.direction; },
      });
      const tick = () => {
        const v = st.getVelocity();
        const target = dir * (1 + Math.min(Math.abs(v) / 260, 7));
        ts += (target - ts) * 0.07;
        loop.timeScale(ts);
        skew(gsap.utils.clamp(-9, 9, v / -240));
      };
      gsap.ticker.add(tick);
      return () => { gsap.ticker.remove(tick); st.kill(); loop.kill(); gsap.set(t, { clearProps: "transform" }); };
    });
    return () => mm.revert();
  }, []);

  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {words.map((w, i) => (
        <li key={`${w}-${hidden}`} className={i % 2 ? "is-solid" : undefined}>
          <span>{w}</span><i aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={root} className="marquee" role="region" aria-label="Cortes y mesas de la casa">
      <div ref={track} className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
