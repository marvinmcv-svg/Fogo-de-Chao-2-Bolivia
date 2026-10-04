import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema, pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { mapsLink, site, telLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = pageMeta({ title: "Contacto", description: "Escríbenos o llámanos: reservas, eventos, sugerencias. WhatsApp, teléfono y formulario de contacto de Fogo de Chão Bolivia.", path: "/contacto" });

export default function ContactoPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Contacto", path: "/contacto" }])} />
      <PageHero eyebrow="Contacto" title={"Hablemos."} lede="Reservas, eventos, sugerencias. Respondemos lo antes posible." />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid contact">
          <div className="contact__form" data-fade><ContactForm /></div>
          <aside className="contact__side stack-m">
            <div>
              <h2 className="meta">WhatsApp</h2>
              <a className="contact__big" href={whatsappLink()} target="_blank" rel="noopener noreferrer">{site.phones.whatsapp.display}</a>
            </div>
            <div>
              <h2 className="meta">Teléfono</h2>
              <a className="contact__big" href={telLink(site.phones.landline.e164)}>{site.phones.landline.display}</a>
            </div>
            <div>
              <h2 className="meta">Restaurante</h2>
              <p><a className="link-plain" href={mapsLink} target="_blank" rel="noopener noreferrer">{site.address.line1}<br />{site.address.line2}<br />{site.address.city}</a></p>
            </div>
            <div>
              <h2 className="meta">Horarios, todos los días</h2>
              <p className="num">{site.hours.map((h) => `${h.label} ${h.open} a ${h.close}`).join(", ")}</p>
            </div>
            <div className="btn-row">
              <a className="link" href={site.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              <a className="link" href={site.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              <button type="button" className="link" data-concierge>Preguntar al concierge</button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
