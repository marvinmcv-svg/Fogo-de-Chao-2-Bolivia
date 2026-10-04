import Image from "next/image";
import type { CSSProperties } from "react";
import { Split } from "../ui/Split";
import { Button } from "../ui/Button";
import { OpenNow } from "../OpenNow";
import { HeroVideo } from "./HeroVideo";
import { Embers } from "./Embers";
import { HeroPlayToggle } from "./HeroPlayToggle";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title" data-hero>
      <div className="hero__media" aria-hidden="true">
        <Image src="/media/img/hero-poster.webp" alt="" fill priority sizes="100vw" className="hero__poster" />
        <HeroVideo />
        <div className="hero__glow"><i /><i /><i /></div>
        <div className="hero__scrim" />
        <Embers />
      </div>

      <div className="container hero__inner">
        <p className="eyebrow hero__kicker" data-fade data-intro style={{ "--d": "0.3s" } as CSSProperties}>
          Rodizio brasileño en {site.city}
        </p>

        <div className="hero__body">
          <Split as="h1" className="h1 hero__title" id="hero-title" text={"El fuego\n*no se apaga.*"} delay={0.25} intro />

          <div className="hero__side stack-m" data-fade data-intro style={{ "--d": "0.9s" } as CSSProperties}>
            <p className="lede">Cortes tallados a tu mesa, sobre brasas vivas. Tú marcas el ritmo.</p>
            <div className="btn-row">
              <Button href="/reservas">Reservar mesa</Button>
              <Button href="/menu" variant="ghost" arrow={false}>Ver menú</Button>
            </div>
          </div>
        </div>

        <div className="hero__foot" data-fade data-intro style={{ "--d": "1.2s" } as CSSProperties}>
          <OpenNow />
          <span className="meta hero__loc">{site.location}</span>
          <HeroPlayToggle />
        </div>
      </div>
    </section>
  );
}
