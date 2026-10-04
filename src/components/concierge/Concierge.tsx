"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { bookStart, bookStep, chips, fallback, greeting, ruleReply, whatsappForPath, type Action, type Book, type Reply } from "@/lib/concierge";
import { whatsappLink } from "@/lib/site";
import { Arrow, WhatsAppIcon } from "../ui/Icons";
import { WhatsAppCard } from "./WhatsAppCard";

type Msg = { id: number; from: "bot" | "user"; text: string; actions?: Action[]; chips?: string[] };
type Lead = { step: "name" | "phone" | "details"; name?: string; phone?: string } | null;

type SpeechRec = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
type SpeechCtor = new () => SpeechRec;
const speechCtor = (): SpeechCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

let uid = 0;
const mk = (from: Msg["from"], text: string, extra: Partial<Msg> = {}): Msg => ({ id: ++uid, from, text, ...extra });

export function Concierge() {
  const pathname = usePathname();
  const titleId = useId();
  const waId = useId();
  const [panel, setPanel] = useState<"none" | "concierge" | "wa">("none");
  const open = panel === "concierge";
  const waOpen = panel === "wa";
  const setOpen = useCallback((v: boolean) => setPanel(v ? "concierge" : "none"), []);
  const [nudge, setNudge] = useState(false);
  const [listening, setListening] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [book, setBook] = useState<Book>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const waBtnRef = useRef<HTMLButtonElement>(null);
  const [msgs, setMsgs] = useState<Msg[]>(() => [mk("bot", greeting.text, { chips: greeting.chips })]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [lead, setLead] = useState<Lead>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const history = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const push = useCallback((...m: Msg[]) => setMsgs((prev) => [...prev, ...m]), []);

  // Open from anywhere: <button data-concierge> or window.dispatchEvent(new Event("concierge:open")).
  useEffect(() => {
    const openIt = () => setOpen(true);
    const onClick = (e: MouseEvent) => { if ((e.target as Element | null)?.closest?.("[data-concierge]")) openIt(); };
    window.addEventListener("concierge:open", openIt);
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("concierge:open", openIt); document.removeEventListener("click", onClick); };
  }, [setOpen]);

  // Feature-detect voice input after mount (keeps server and client markup identical).
  useEffect(() => {
    const id = window.setTimeout(() => setCanSpeak(!!speechCtor()), 0);
    return () => window.clearTimeout(id);
  }, []);

  // One polite, dismissible nudge per session, never on the booking page or once the concierge has been opened.
  useEffect(() => {
    if (pathname.startsWith("/reservas")) return;
    const id = window.setTimeout(() => {
      try {
        if (sessionStorage.getItem("fogo:nudge")) return;
        sessionStorage.setItem("fogo:nudge", "1");
      } catch { /* storage blocked: still show it once per page load */ }
      setNudge(true);
    }, 22_000);
    const hide = window.setTimeout(() => setNudge(false), 22_000 + 16_000);
    return () => { window.clearTimeout(id); window.clearTimeout(hide); };
  }, [pathname]);

  // Close the WhatsApp card with Escape or a click outside it.
  useEffect(() => {
    if (!waOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setPanel("none"); waBtnRef.current?.focus(); } };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest?.(".wacard, .dock__wa")) setPanel("none");
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [waOpen]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); launcherRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); recRef.current?.stop(); };
  }, [open, setOpen]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const botSay = useCallback((r: Reply) => {
    push(mk("bot", r.text, { actions: r.actions, chips: r.chips }));
    history.current.push({ role: "assistant", content: r.text });
    if (r.startLead) setLead({ step: "name" });
  }, [push]);

  function toggleMic() {
    if (listening) { recRef.current?.stop(); return; }
    const Ctor = speechCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "es-BO";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => setDraft(Array.from(e.results).map((r) => r[0].transcript).join(" "));
    rec.onend = () => { setListening(false); inputRef.current?.focus(); };
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  async function submitLead(name: string, phone: string, details: string) {
    setBusy(true);
    const message = `${details} (enviado desde el concierge del sitio)`;
    let delivered = false;
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, topic: "Grupo o celebración", message, source: "concierge" }),
      });
      delivered = res.ok && !!(await res.json().catch(() => ({}))).delivered;
    } catch { /* fall through to WhatsApp */ }
    setBusy(false);
    const wa: Action = { label: "Enviar también por WhatsApp", href: whatsappLink(`Hola, soy ${name}. ${details}. Mi teléfono: ${phone}.`), external: true };
    botSay(delivered
      ? { text: `Gracias, ${name}. Dejé tu solicitud al equipo y te contactarán al ${phone}. Si es urgente, también puedes escribir por WhatsApp.`, actions: [wa] }
      : { text: `Gracias, ${name}. Para asegurarnos de que llegue, envíala por WhatsApp: ya dejé el mensaje listo.`, actions: [wa] });
  }

  async function handle(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    push(mk("user", text));
    history.current.push({ role: "user", content: text });
    setDraft("");

    // Lead capture flow
    if (lead) {
      if (lead.step === "name") {
        if (text.length < 2) return botSay({ text: "¿Cómo te llamas?" });
        setLead({ step: "phone", name: text });
        return botSay({ text: `Gracias, ${text}. ¿A qué número te contactamos? (WhatsApp o teléfono)` });
      }
      if (lead.step === "phone") {
        if (text.replace(/\D/g, "").length < 7) return botSay({ text: "Ese número no parece completo. ¿Puedes escribirlo de nuevo?" });
        setLead({ step: "details", name: lead.name, phone: text });
        return botSay({ text: "Por último, cuéntanos brevemente: ¿qué celebración o grupo, qué fecha y cuántas personas?" });
      }
      const { name = "", phone = "" } = lead;
      setLead(null);
      return submitLead(name, phone, text);
    }

    // Guided booking request
    if (book) {
      const r = bookStep(book, text);
      setBook(r.state);
      return botSay(r.reply);
    }
    if (text === chips.book) {
      const r = bookStart();
      setBook(r.state);
      return botSay(r.reply);
    }

    if (text === chips.lead) {
      setLead({ step: "name" });
      return botSay({ text: "Con gusto. ¿Cómo te llamas?" });
    }

    const rule = ruleReply(text);
    if (rule) return botSay(rule);

    // Outside verified facts: ask the model if the server has one configured, otherwise hand off.
    setBusy(true);
    try {
      const res = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.current.slice(-10) }) });
      const data = res.ok ? await res.json() : null;
      setBusy(false);
      if (data?.mode === "llm" && data.reply) {
        return botSay({ text: data.reply, actions: [{ label: "Reservar en línea", href: "/reservas" }, { label: "WhatsApp", href: whatsappLink(whatsappForPath(pathname)), external: true }] });
      }
    } catch {
      setBusy(false);
    }
    botSay(fallback);
  }

  return (
    <aside aria-label="Contacto rápido: concierge y WhatsApp">
      <div className="dock">
        <button ref={launcherRef} type="button" className="dock__concierge" aria-haspopup="dialog" aria-expanded={open} onClick={() => setPanel(open ? "none" : "concierge")}>
          <span className="orb orb--sm" aria-hidden="true" /> Concierge
        </button>
        <button ref={waBtnRef} type="button" className="dock__wa" aria-haspopup="dialog" aria-expanded={waOpen} aria-label="WhatsApp: abrir opciones de mensaje" onClick={() => setPanel(waOpen ? "none" : "wa")}>
          <WhatsAppIcon />
          <span className="dock__tip" aria-hidden="true">WhatsApp</span>
        </button>
        <WhatsAppCard open={waOpen} labelledBy={waId} onClose={() => { setPanel("none"); waBtnRef.current?.focus(); }} />
        {nudge && !open && !waOpen && (
          <div className="nudge" role="status">
            <p>¿Te ayudo a pedir tu mesa?</p>
            <div>
              <button type="button" className="nudge__yes" onClick={() => { setNudge(false); setPanel("concierge"); const r = bookStart(); setBook(r.state); botSay(r.reply); }}>Sí, ayúdame</button>
              <button type="button" className="nudge__no" onClick={() => setNudge(false)} aria-label="Cerrar sugerencia">Ahora no</button>
            </div>
          </div>
        )}
      </div>

      <div className={`sheet-scrim${open ? " is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <section className={`sheet${open ? " is-open" : ""}`} role="dialog" aria-modal="false" aria-labelledby={titleId} aria-hidden={!open} inert={!open}>
        <header className="sheet__head">
          <span className={`orb${busy ? " is-busy" : ""}${listening ? " is-listening" : ""}`} aria-hidden="true" />
          <div className="sheet__headtxt">
            <h2 id={titleId} className="sheet__title">Concierge</h2>
            <p className="sheet__sub">Asistente virtual de Fogo de Chão</p>
          </div>
          <button type="button" className="sheet__close" onClick={() => { setOpen(false); launcherRef.current?.focus(); }} aria-label="Cerrar concierge">
            <span /><span />
          </button>
        </header>

        <div className="sheet__log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions" aria-busy={busy}>
          {msgs.map((m, i) => (
            <div key={m.id} className={`msg msg--${m.from}`}>
              <p>{m.text}</p>
              {m.actions && (
                <div className="msg__actions">
                  {m.actions.map((a) =>
                    a.external || a.href.startsWith("tel:") ? (
                      <a key={a.label} className="msg__action" href={a.href} {...(a.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{a.label}<Arrow /></a>
                    ) : (
                      <Link key={a.label} className="msg__action" href={a.href} onClick={() => setOpen(false)}>{a.label}<Arrow /></Link>
                    ),
                  )}
                </div>
              )}
              {m.chips && i === msgs.length - 1 && !busy && (
                <div className="msg__chips">
                  {m.chips.map((c) => <button key={c} type="button" onClick={() => handle(c)}>{c}</button>)}
                </div>
              )}
            </div>
          ))}
          {busy && <div className="msg msg--bot msg--typing" role="status"><span className="sr-only">Escribiendo…</span><i /><i /><i /></div>}
        </div>

        <form className="sheet__form" onSubmit={(e) => { e.preventDefault(); void handle(draft); }}>
          <label htmlFor={`${titleId}-in`} className="sr-only">Escribe tu mensaje</label>
          <input
            id={`${titleId}-in`} ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)}
            placeholder={listening ? "Te escucho…" : lead ? "Escribe tu respuesta…" : "Escribe tu consulta…"} maxLength={500} autoComplete="off"
            inputMode={lead?.step === "phone" ? "tel" : "text"}
          />
          {canSpeak && (
            <button type="button" className="sheet__mic" onClick={toggleMic} aria-pressed={listening} aria-label={listening ? "Detener dictado" : "Dictar mensaje por voz"}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          )}
          <button type="submit" disabled={busy || !draft.trim()} aria-label="Enviar"><Arrow /></button>
        </form>
        <p className="sheet__note">Asistente automático. No confirma reservas ni reemplaza al equipo.</p>
      </section>
    </aside>
  );
}
