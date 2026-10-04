"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { cuts } from "@/lib/site";
import { registerGsap } from "@/lib/motion";
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
    mm.add("(min-width: 62rem) and (prefers-reduced-motion: no-preference)", () => {
      const t = track.current!;
      const dist = () => t.scrollWidth - window.innerWidth;
      const st = { trigger: root.current, start: "top top", end: () => `+=${dist()}`, scrub: 0.7, pin: true, invalidateOnRefresh: true, anticipatePin: 1 };
      gsap.to(t, { x: () => -dist(), ease: "none", scrollTrigger: st });
      gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { ...st, pin: false, anticipatePin: 0 } });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="cuts" aria-labelledby="cuts-title">
      <div className="cuts__track" ref={track} tabIndex={0} role="group" aria-label="Cortes: desliza horizontalmente">
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
