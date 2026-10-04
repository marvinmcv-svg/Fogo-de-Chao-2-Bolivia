"use client";

import { whatsappLink, site } from "@/lib/site";
import { OpenNow } from "../OpenNow";
import { Arrow, WhatsAppIcon } from "../ui/Icons";

const quick = [
  { label: "Reservar una mesa", msg: "Hola, quisiera reservar una mesa en Fogo de Chão." },
  { label: "Celebraciones y grupos", msg: "Hola, quisiera coordinar una celebración o reserva para un grupo." },
  { label: "Horarios y ubicación", msg: "Hola, quisiera confirmar horarios y cómo llegar a Fogo de Chão." },
  { label: "Otra consulta", msg: "Hola, me gustaría hacer una consulta en Fogo de Chão." },
] as const;

/** WhatsApp widget: a small card with the restaurant's live status and one-tap, pre-written messages. */
export function WhatsAppCard({ open, labelledBy, onClose }: { open: boolean; labelledBy: string; onClose: () => void }) {
  return (
    <section className={`wacard${open ? " is-open" : ""}`} role="dialog" aria-modal="false" aria-labelledby={labelledBy} aria-hidden={!open} inert={!open}>
      <header className="wacard__head">
        <span className="wacard__mark" aria-hidden="true"><WhatsAppIcon /></span>
        <div>
          <h2 id={labelledBy} className="wacard__title">Escríbenos por WhatsApp</h2>
          <OpenNow className="wacard__status" />
        </div>
        <button type="button" className="sheet__close" onClick={onClose} aria-label="Cerrar WhatsApp"><span /><span /></button>
      </header>
      <div className="wacard__body">
        <p className="wacard__bubble">Hola. Elige un tema y te dejamos el mensaje listo para enviar al equipo.</p>
        <ul className="wacard__quick">
          {quick.map((q) => (
            <li key={q.label}>
              <a href={whatsappLink(q.msg)} target="_blank" rel="noopener noreferrer">{q.label}<Arrow /></a>
            </li>
          ))}
        </ul>
      </div>
      <footer className="wacard__foot">
        <a className="btn btn-primary" href={whatsappLink()} target="_blank" rel="noopener noreferrer"><span>Abrir chat {site.phones.whatsapp.display}</span><Arrow /></a>
      </footer>
    </section>
  );
}
