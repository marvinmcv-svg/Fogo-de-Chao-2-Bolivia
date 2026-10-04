"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { registerGsap } from "@/lib/motion";
import { Button } from "../ui/Button";

const tiles = [
  { src: "/media/img/gaucho-carving.webp", alt: "Un gaúcho talla un corte sobre la mesa", scale: 4 },
  { src: "/media/img/skewers.webp", alt: "Espadas de carne sobre las brasas", scale: 5 },
  { src: "/media/img/picanha-roast.webp", alt: "Picanha asada entera", scale: 6 },
  { src: "/media/img/caipirinha.webp", alt: "Caipirinha recién preparada", scale: 5 },
  { src: "/media/img/feijoada.webp", alt: "Feijoada con arroz y farofa", scale: 6 },
  { src: "/media/img/steak-sear.webp", alt: "Un corte sellándose en la parrilla", scale: 8 },
  { src: "/media/img/postre.webp", alt: "Postre de la casa", scale: 9 },
] as const;

/**
 * Zoom parallax: the section pins, every photo scales out from the centre at its own rate until the middle frame
 * fills the screen, and the closing line and reservation call arrive on top. Reduced motion gets a static collage.
 */
export function ZoomGallery() {
  const root = useRef<HTMLElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { gsap } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const layers = gsap.utils.toArray<HTMLElement>(".zoom__layer", root.current!);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=260%", scrub: 0.6, pin: true, anticipatePin: 1 },
      });
      layers.forEach((l, i) => tl.to(l, { scale: tiles[i].scale }, 0));
      tl.to(shade.current, { opacity: 1 }, 0.45);
      tl.fromTo(cta.current, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.35 }, 0.7);
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="zoom" aria-labelledby="zoom-title">
      <div className="zoom__stage">
        {tiles.map((t, i) => (
          <div className="zoom__layer" key={t.src} aria-hidden={i === 0 ? undefined : true}>
            <div className={`zoom__box zoom__box--${i}`}>
              <Image src={t.src} alt={i === 0 ? t.alt : ""} fill sizes={i === 0 ? "100vw" : "40vw"} />
            </div>
          </div>
        ))}
        <div className="zoom__shade" ref={shade} aria-hidden="true" />
        <div className="zoom__cta" ref={cta}>
          <h2 className="h2" id="zoom-title">Tu mesa<br /><em>ya está encendida.</em></h2>
          <div className="btn-row"><Button href="/reservas">Reservar mesa</Button></div>
        </div>
      </div>
    </section>
  );
}
