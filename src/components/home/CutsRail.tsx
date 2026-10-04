"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { cuts } from "@/lib/site";
import { registerGsap, smooth } from "@/lib/motion";
import { Split } from "../ui/Split";
import { Button } from "../ui/Button";

/**
 * Desktop: section pins and the rail travels horizontally, scrubbed by scroll.
 * Mobile / reduced motion: a native, snap-scrolling horizontal rail (no pinning, no hijacked scroll).
 */
export function CutsRail() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const { gsap } = registerGsap();
    const mm = gsap.matchMedia();
    // Natively scrollable rail (mobile / reduced motion): make it reachable and operable from the keyboard.
    mm.add("(max-width: 61.99rem), (prefers-reduced-motion: reduce)", () => {
      const t = track.current!;
      t.tabIndex = 0;
      t.setAttribute("role", "group");
      t.setAttribute("aria-label", "Cortes: desplázate horizontalmente");
      return () => { t.removeAttribute("tabindex"); t.removeAttribute("role"); t.removeAttribute("aria-label"); };
    });
    mm.add("(min-width: 62rem) and (prefers-reduced-motion: no-preference)", () => {
      const t = track.current!;
      const dist = () => t.scrollWidth - window.innerWidth;
      const st = { trigger: root.current, start: "top top", end: () => `+=${dist()}`, scrub: 0.7, pin: true, invalidateOnRefresh: true, anticipatePin: 1 };
      const travel = gsap.to(t, { x: () => -dist(), ease: "none", scrollTrigger: st });
      // Keyboard: focusing something that is currently off-screen in the rail scrolls the page to bring it into view.
      const onFocusIn = (e: FocusEvent) => {
        const el = e.target as HTMLElement;
        const trig = travel.scrollTrigger;
        if (!trig) return;
        const left = el.getBoundingClientRect().left - t.getBoundingClientRect().left; // position within the track
        const target = Math.min(Math.max(left - window.innerWidth * 0.2, 0), dist());
        const y = trig.start + (target / dist()) * (trig.end - trig.start);
        smooth.lenis ? smooth.lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
      };
      t.addEventListener("focusin", onFocusIn);
      // Each photo drifts against the rail's motion, so the cuts feel set into the frame rather than pasted on.
      gsap.utils.toArray<HTMLElement>(".cut", t).forEach((card) => {
        const img = card.querySelector<HTMLElement>(".cut__img img");
        if (!img) return;
        gsap.fromTo(img, { xPercent: -7 }, {
          xPercent: 7, ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: travel, start: "left right", end: "right left", scrub: true },
        });
      });
      gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { ...st, pin: false, anticipatePin: 0 } });
      return () => t.removeEventListener("focusin", onFocusIn);
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="cuts" aria-labelledby="cuts-title">
      <div className="cuts__track" ref={track}>
        <div className="cuts__intro">
          <span className="eyebrow" data-fade>Los cortes</span>
          <Split as="h2" className="h2" id="cuts-title" text={"Tallados\n*al momento.*"} />
          <p className="body" data-fade>
            Cada corte desfila sobre la espada y se talla en tu plato, al punto que pidas. La rotación varía según disponibilidad:
            pregunta a tu maître por las especialidades del día.
          </p>
        </div>

        {cuts.map((c, i) => (
          <article className="cut" key={c.name}>
            <div className="cut__img mask">
              <Image src={c.image} alt={`${c.name}: ${c.note}`} fill sizes="(min-width: 62rem) 32vw, 78vw" />
            </div>
            <div className="cut__txt">
              <span className="num meta">0{i + 1}</span>
              <h3 className="display cut__name">{c.name}</h3>
              <p className="body">{c.note}</p>
            </div>
          </article>
        ))}

        <div className="cuts__outro">
          <p className="h3">Y lo que el fuego traiga <em>esta noche.</em></p>
          <Button href="/reservas">Reservar mesa</Button>
        </div>
      </div>
      <div className="cuts__progress" aria-hidden="true"><span ref={bar} /></div>
    </section>
  );
}
