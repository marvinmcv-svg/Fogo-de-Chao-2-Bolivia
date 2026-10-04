"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { whatsappLink } from "@/lib/site";
import { Arrow } from "./ui/Icons";

type Status = "idle" | "sending" | "sent" | "fallback" | "error";

const topics = ["Reserva", "Evento o grupo", "Comentario o sugerencia", "Otro"] as const;

export function ContactForm({ defaultTopic = "Reserva" }: { defaultTopic?: (typeof topics)[number] }) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wa, setWa] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Move focus to the first invalid field once the error state has rendered.
  useEffect(() => {
    if (Object.keys(errors).length) formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [errors]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const next: Record<string, string> = {};
    if (!data.name?.trim()) next.name = "Escribe tu nombre.";
    if (data.phone.replace(/\D/g, "").length < 7) next.phone = "Escribe un teléfono válido (mínimo 7 dígitos).";
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) next.email = "El correo no parece válido.";
    if (!("consent" in data)) next.consent = "Necesitamos tu autorización para contactarte.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const message = [`Hola, soy ${data.name}.`, `Motivo: ${data.topic}.`, data.message?.trim().replace(/[.!?]*$/, "."), `Mi teléfono: ${data.phone}.`].filter(Boolean).join(" ");
    setWa(whatsappLink(message));
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.delivered) setStatus("sent");
      else if (res.ok) setStatus("fallback");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="form-done" role="status">
        <h3 className="h3">Gracias. <em>Te escribimos pronto.</em></h3>
        <p className="body">Recibimos tu mensaje. Si es urgente, también puedes escribirnos por WhatsApp.</p>
        <a className="btn btn-ghost" href={whatsappLink()} target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><Arrow /></a>
      </div>
    );
  }
  if (status === "fallback" || status === "error") {
    return (
      <div className="form-done" role="status">
        <h3 className="h3">{status === "error" ? "No pudimos enviarlo." : "Un paso más."} <em>Escríbenos por WhatsApp.</em></h3>
        <p className="body">Dejamos tu mensaje listo: solo tienes que enviarlo y te responderemos por ahí.</p>
        <a className="btn btn-primary" href={wa} target="_blank" rel="noopener noreferrer"><span>Abrir WhatsApp</span><Arrow /></a>
      </div>
    );
  }

  const f = (n: string) => `${uid}-${n}`;
  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor={f("name")}>Nombre *</label>
        <input id={f("name")} name="name" autoComplete="name" required aria-invalid={!!errors.name} aria-describedby={errors.name ? f("name-e") : undefined} />
        {errors.name && <p className="field__err" id={f("name-e")}>{errors.name}</p>}
      </div>
      <div className="field">
        <label htmlFor={f("phone")}>Teléfono / WhatsApp *</label>
        <input id={f("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? f("phone-e") : undefined} />
        {errors.phone && <p className="field__err" id={f("phone-e")}>{errors.phone}</p>}
      </div>
      <div className="field">
        <label htmlFor={f("email")}>Correo electrónico</label>
        <input id={f("email")} name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? f("email-e") : undefined} />
        {errors.email && <p className="field__err" id={f("email-e")}>{errors.email}</p>}
      </div>
      <div className="field">
        <label htmlFor={f("topic")}>Motivo</label>
        <select id={f("topic")} name="topic" defaultValue={defaultTopic}>
          {topics.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="field field--wide">
        <label htmlFor={f("message")}>Mensaje</label>
        <textarea id={f("message")} name="message" rows={4} maxLength={1200} />
      </div>
      {/* honeypot: hidden from people, tempting to bots */}
      <div className="hp" aria-hidden="true"><label>No completar<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="field field--wide field--check">
        <input id={f("consent")} name="consent" type="checkbox" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? f("consent-e") : undefined} />
        <label htmlFor={f("consent")}>Autorizo que Fogo de Chão use estos datos para responderme. <Link href="/privacidad">Privacidad</Link></label>
        {errors.consent && <p className="field__err" id={f("consent-e")}>{errors.consent}</p>}
      </div>
      <div className="field--wide">
        <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
          <span>{status === "sending" ? "Enviando…" : "Enviar mensaje"}</span><Arrow />
        </button>
      </div>
    </form>
  );
}
