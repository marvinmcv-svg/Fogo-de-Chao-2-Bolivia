"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { site, whatsappLink } from "@/lib/site";
import { Arrow } from "../ui/Icons";

const guestOptions = [...Array.from({ length: 10 }, (_, i) => String(i + 1)), "11+"];

/** Today in Bolivia (UTC-4, no DST), formatted for <input type="date">. Runs on the client only. */
const subscribeNever = () => () => {};
const todayLaPaz = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/La_Paz" }).format(new Date());

/**
 * Quick reservation: the visitor sets date, party size and service, then either checks availability on the
 * booking system of record (Restoo) or sends the same details to the team by WhatsApp. It never confirms anything itself.
 */
export function QuickBook() {
  const uid = useId();
  // Server snapshot is empty so hydration matches; the client reads today's date in Bolivia.
  const today = useSyncExternalStore(subscribeNever, todayLaPaz, () => "");
  const [picked, setPicked] = useState("");
  const date = picked || today;
  const [guests, setGuests] = useState("2");
  const [shift, setShift] = useState<string>(site.hours[1].label);

  const when = date ? new Date(`${date}T12:00:00`).toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" }) : "";
  const people = guests === "11+" ? "más de 10 personas" : `${guests} ${guests === "1" ? "persona" : "personas"}`;
  const message = `Hola, quisiera reservar para ${people}${when ? ` el ${when}` : ""}, en el turno de ${shift.toLowerCase()}. ¿Tienen disponibilidad?`;

  return (
    <section className="quick" aria-label="Reserva rápida">
      <div className="container">
        <div className="bezel quick__bezel" data-fade>
          <form className="bezel__core quick__core" onSubmit={(e) => e.preventDefault()}>
            <div className="qf">
              <label htmlFor={`${uid}-d`}>Fecha</label>
              <input id={`${uid}-d`} type="date" value={date} min={today || undefined} onChange={(e) => setPicked(e.target.value)} />
            </div>
            <div className="qf">
              <label htmlFor={`${uid}-g`}>Personas</label>
              <select id={`${uid}-g`} value={guests} onChange={(e) => setGuests(e.target.value)}>
                {guestOptions.map((g) => <option key={g} value={g}>{g === "11+" ? "Más de 10" : g}</option>)}
              </select>
            </div>
            <div className="qf">
              <label htmlFor={`${uid}-s`}>Turno</label>
              <select id={`${uid}-s`} value={shift} onChange={(e) => setShift(e.target.value)}>
                {site.hours.map((h) => <option key={h.label} value={h.label}>{h.label}, {h.open} a {h.close}</option>)}
              </select>
            </div>
            <div className="quick__actions">
              <Link className="btn btn-primary" data-magnetic href="/reservas"><span>Ver disponibilidad</span><Arrow /></Link>
              <a className="btn btn-ghost" href={whatsappLink(message)} target="_blank" rel="noopener noreferrer"><span>Pedir por WhatsApp</span></a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
