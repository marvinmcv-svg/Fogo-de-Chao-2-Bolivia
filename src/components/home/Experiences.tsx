import Image from "next/image";
import type { CSSProperties } from "react";
import { Split } from "../ui/Split";
import { Button } from "../ui/Button";

const cards = [
  {
    id: "market",
    tone: "amber",
    title: "Una mesa que *no se vacía.*",
    text: "Inspirada en las mesas del sur de Brasil, donde familias y amigos comparten lo mejor de sus cosechas: ensaladas de temporada, verduras frescas, quesos, panes y más.",
    name: "Market Table",
    image: "/media/img/feijoada.webp",
    alt: "Feijoada, arroz, farofa y verduras sobre la mesa",
    cta: null,
  },
  {
    id: "bar",
    tone: "wine",
    title: "Sabores de Brasil, *sin prisa.*",
    text: "Un ambiente más casual para relajarse con amigos: cócteles artesanales, vinos seleccionados y platos pequeños inspirados en Brasil.",
    name: "Bar Fogo",
    image: "/media/img/caipirinha.webp",
    alt: "Una caipirinha recién preparada en la barra",
    cta: { href: "/menu", label: "Explorar el menú" },
  },
  {
    id: "events",
    tone: "ember",
    title: "Tu celebración, *a la brasa.*",
    text: "Cumpleaños, aniversarios y reuniones de empresa. Cuéntanos la fecha y cuántos serán, y coordinamos cada detalle contigo.",
    name: "Eventos",
    image: "/media/img/carving-table.webp",
    alt: "La mesa de tallado con cortes recién salidos de la brasa",
    cta: { href: "/eventos", label: "Planear un evento" },
  },
] as const;

/** Sticky-stack: each panel pins under the header and the previous one recedes (see Motion → [data-stack]). */
export function Experiences() {
  return (
    <section className="section experiences" aria-labelledby="exp-title" data-tone="amber">
      <div className="container">
        <header className="experiences__head">
          <Split as="h2" className="h2" id="exp-title" text={"Más allá\nde la *brasa.*"} />
        </header>

        <div className="stack">
          {cards.map((c, i) => (
            <article key={c.id} className={`stack__card stack__card--${c.tone} spot`} data-stack style={{ "--n": i } as CSSProperties}>
              <div className="stack__shade" aria-hidden="true" />
              <div className="stack__txt stack-s">
                <p className="meta">{c.name}</p>
                <Split as="h3" className="h3" text={c.title} />
                <p className="body">{c.text}</p>
                {c.cta && <div><Button href={c.cta.href} variant="ghost">{c.cta.label}</Button></div>}
              </div>
              <div className="stack__img mask" data-parallax="5">
                <Image src={c.image} alt={c.alt} fill sizes="(min-width: 62rem) 46vw, 100vw" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
