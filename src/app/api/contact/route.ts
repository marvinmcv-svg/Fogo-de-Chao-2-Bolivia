import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Best-effort, per-instance rate limit (serverless instances do not share memory).
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_HITS = 5;

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (clean(body.company, 100)) return NextResponse.json({ ok: true, delivered: true }); // honeypot: pretend success

  const lead = {
    name: clean(body.name, 120),
    phone: clean(body.phone, 40),
    email: clean(body.email, 160),
    topic: clean(body.topic, 60),
    message: clean(body.message, 1200),
    source: clean(body.source, 40) || "contact-form",
    at: new Date().toISOString(),
  };
  if (!lead.name || lead.phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  const hook = process.env.LEAD_WEBHOOK_URL;
  if (!hook) {
    // No destination configured: tell the client so it can fall back to WhatsApp instead of silently dropping the lead.
    return NextResponse.json({ ok: true, delivered: false }, { status: 202 });
  }
  try {
    const r = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // `text` makes this work out of the box with Slack/Discord-style incoming webhooks; full payload for Zapier/Make.
      body: JSON.stringify({ ...lead, text: `Nuevo contacto (${lead.source}): ${lead.name} · ${lead.phone}${lead.email ? ` · ${lead.email}` : ""}\nMotivo: ${lead.topic}\n${lead.message}` }),
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json({ ok: r.ok, delivered: r.ok }, { status: r.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false, delivered: false }, { status: 502 });
  }
}
