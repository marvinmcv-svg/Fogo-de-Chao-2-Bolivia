import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema, pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { Split } from "@/components/ui/Split";
import { occasions, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Eventos y celebraciones",
  description: "Cumpleaños, aniversarios y reuniones de empresa en Fogo de Chão Bolivia. Cuéntanos la fecha y el número de personas y coordinamos cada detalle.",
  path: "/eventos",
});

export default function EventosPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Eventos", path: "/eventos" }])} />
      <PageHero eyebrow="Eventos" title={"Celebra\n*a la brasa.*"} lede="Grupos, aniversarios y reuniones de empresa. Tú pones la ocasión, nosotros coordinamos el resto." />

      <section className="section occ" aria-labelledby="occ-title" data-tone="ember" style={{ paddingTop: 0 }}>
        <div className="container grid">
          <Split as="h2" className="h3 occ__title" id="occ-title" text="Cuatro ocasiones, *una misma mesa.*" />
          <ul className="occ__list">
            {occasions.map((o) => (
              <li key={o.name} className="occ__item spot" data-tilt data-fade>
                <h3 className="h3">{o.name}</h3>
                <p className="body">{o.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="ev-form-title" style={{ paddingTop: 0 }}>
        <div className="container grid contact">
          <div className="contact__form stack-m" data-fade>
            <Split as="h2" className="h3" id="ev-form-title" text="Cuéntanos *tu fecha.*" />
            <ContactForm defaultTopic="Evento o grupo" variant="event" />
          </div>
          <aside className="contact__side stack-m">
            <div>
              <h2 className="meta">Prefieres escribir</h2>
              <a className="contact__big" href={whatsappLink("Hola, quisiera coordinar una celebración o reserva para un grupo.")} target="_blank" rel="noopener noreferrer">{site.phones.whatsapp.display}</a>
            </div>
            <p className="body">El equipo te responde con disponibilidad y los detalles de tu fecha. Una solicitud no es una reserva hasta que el restaurante la confirme.</p>
            <div className="btn-row"><button type="button" className="link" data-concierge>Preguntar al concierge</button></div>
          </aside>
        </div>
      </section>
    </>
  );
}
