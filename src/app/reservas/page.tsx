import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema, pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";
import { site, telLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = pageMeta({ title: "Reservas", description: "Reserva tu mesa en Fogo de Chão Bolivia, Ventura Mall, Santa Cruz de la Sierra. Reserva en línea o por WhatsApp.", path: "/reservas" });

export default function ReservasPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Reservas", path: "/reservas" }])} />
      <PageHero eyebrow="Reservas" title={"Reserva\n*tu mesa.*"} lede="Reserva en línea, o escríbenos por WhatsApp si prefieres hablar con alguien." />
      <section className="section book" style={{ paddingTop: 0 }}>
        <div className="container book__grid">
          <aside className="book__aside stack-m">
            <dl className="book__facts num">
              <dt className="meta">Horarios · todos los días</dt>
              {site.hours.map((h) => <dd key={h.label}><span>{h.label}</span><span>{h.open} – {h.close}</span></dd>)}
            </dl>
            <p className="body">¿Grupos grandes o celebraciones? Escríbenos y lo coordinamos.</p>
            <div className="btn-row">
              <Button href={whatsappLink()} variant="ghost" arrow={false}>WhatsApp {site.phones.whatsapp.display}</Button>
              <a className="link" href={telLink(site.phones.landline.e164)}>Llamar · {site.phones.landline.display}</a>
              <button type="button" className="link" data-concierge>Preguntar al concierge</button>
            </div>
          </aside>
          <div className="book__frame">
            <iframe title="Reservas en línea de Fogo de Chão" src={site.booking} loading="lazy" />
            <p className="book__alt">
              ¿No carga el formulario? <a className="link" href={site.booking} target="_blank" rel="noopener noreferrer">Abrir reservas en una pestaña nueva</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
