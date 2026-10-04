import Link from "next/link";
import { Split } from "./ui/Split";
import { Button } from "./ui/Button";
import { mapsLink, nav, site, telLink, whatsappLink } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__cta stack-m">
        <span className="eyebrow">Reservas</span>
        <Split as="h2" className="display" text={"Una mesa,\n*una brasa.*"} />
        <div className="btn-row">
          <Button href="/reservas">Reservar mesa</Button>
          <Button href={whatsappLink()} variant="ghost" arrow={false}>Escribir por WhatsApp</Button>
        </div>
      </div>
      <hr className="rule" />
      <div className="container grid footer__cols">
        <div className="footer__col" style={{ gridColumn: "span 12" }} data-cols>
          <h2>Visítanos</h2>
          <p>
            <a href={mapsLink} target="_blank" rel="noopener noreferrer">
              {site.address.line1}<br />
              {site.address.line2}<br />
              {site.address.city}, {site.address.country}
            </a>
          </p>
        </div>
        <div className="footer__col" style={{ gridColumn: "span 12" }} data-cols>
          <h2>Horarios · todos los días</h2>
          <ul className="num">
            {site.hours.map((h) => (
              <li key={h.label}>{h.label} · {h.open} – {h.close}</li>
            ))}
          </ul>
        </div>
        <div className="footer__col" style={{ gridColumn: "span 12" }} data-cols>
          <h2>Contacto</h2>
          <ul>
            <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp · {site.phones.whatsapp.display}</a></li>
            <li><a href={telLink(site.phones.landline.e164)}>Teléfono · {site.phones.landline.display}</a></li>
            <li><a href={site.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a> · <a href={site.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>
          </ul>
        </div>
        <div className="footer__col" style={{ gridColumn: "span 12" }} data-cols>
          <h2>Explorar</h2>
          <ul>
            {nav.map((n) => (
              <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container">
        <hr className="rule" />
        <div className="footer__bottom">
          <span>© {year} Fogo de Chão · {site.location}</span>
          <nav aria-label="Legal">
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos">Términos</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
