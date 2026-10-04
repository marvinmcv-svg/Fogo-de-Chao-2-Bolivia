import { Split } from "./ui/Split";
import { Button } from "./ui/Button";
import { OpenNow } from "./OpenNow";
import { mapsEmbed, mapsLink, site, telLink, whatsappLink } from "@/lib/site";

export function Visit({ heading = "Te *esperamos.*" }: { heading?: string }) {
  return (
    <section className="section visit" aria-labelledby="visit-title">
      <div className="container grid">
        <div className="visit__info stack-m">
          <span className="eyebrow" data-fade>Visítanos</span>
          <Split as="h2" className="h2" id="visit-title" text={heading} />
          <address className="visit__addr" data-fade>
            {site.address.line1}<br />{site.address.line2}<br />{site.address.city}, {site.address.country}
          </address>
          <dl className="visit__hours num" data-fade>
            <dt className="meta">Todos los días</dt>
            {site.hours.map((h) => (
              <dd key={h.label}><span>{h.label}</span><span>{h.open} – {h.close}</span></dd>
            ))}
          </dl>
          <OpenNow />
          <div className="btn-row" data-fade>
            <Button href={mapsLink} variant="ghost">Cómo llegar</Button>
            <a className="link" href={telLink(site.phones.landline.e164)}>{site.phones.landline.display}</a>
            <a className="link" href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
        <div className="visit__map mask" data-mask>
          <a className="visit__mapfallback link" href={mapsLink} target="_blank" rel="noopener noreferrer">Ver en Google Maps</a>
          <iframe title={`Mapa: ${site.name}, ${site.location}`} src={mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </div>
    </section>
  );
}
