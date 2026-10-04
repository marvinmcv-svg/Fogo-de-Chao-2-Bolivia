import Image from "next/image";
import { Split } from "../ui/Split";
import { Button } from "../ui/Button";
import { OpenNow } from "../OpenNow";
import { HeroVideo } from "./HeroVideo";
import { Embers } from "./Embers";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title" data-hero>
      <div className="hero__media" aria-hidden="true">
        <Image src="/media/img/hero-poster.webp" alt="" fill priority sizes="100vw" className="hero__poster" />
        <HeroVideo />
        <div className="hero__scrim" />
        <Embers />
      </div>

      <div className="container hero__inner">
        <p className="eyebrow hero__kicker" data-fade data-delay="0.3">
          Rodizio brasileño · {site.city}
        </p>

        <div className="hero__body">
          <Split as="h1" className="h1 hero__title" id="hero-title" text={"El fuego\n*no se apaga.*"} delay={0.25} />

          <div className="hero__side stack-m" data-fade data-delay="0.9">
            <p className="lede">Cortes tallados a tu mesa, sobre brasas vivas. Tú marcas el ritmo.</p>
            <div className="btn-row">
              <Button href="/reservas">Reservar mesa</Button>
              <Button href="/menu" variant="ghost" arrow={false}>Ver menú</Button>
            </div>
          </div>
        </div>

        <div className="hero__foot" data-fade data-delay="1.2">
          <OpenNow />
          <span className="meta hero__loc">{site.location}</span>
          <span className="hero__cue meta" aria-hidden="true">Desliza <i /></span>
        </div>
      </div>
    </section>
  );
}
