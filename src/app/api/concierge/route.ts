import { NextResponse } from "next/server";
import { systemPrompt } from "@/lib/concierge";

export const runtime = "nodejs";

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_HITS = 20;

type Turn = { role: "user" | "assistant"; content: string };

/** Keep the last turns, cap sizes, force a valid alternating sequence that starts with the user. */
function sanitize(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  const turns: Turn[] = [];
  for (const m of raw.slice(-10)) {
    const role = m?.role === "assistant" ? "assistant" : m?.role === "user" ? "user" : null;
    const content = typeof m?.content === "string" ? m.content.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 600) : "";
    if (!role || !content) continue;
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += `\n${content}`;
    else turns.push({ role, content });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns;
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  // No key → tell the client to use its built-in rules instead.
  if (!key) return NextResponse.json({ mode: "rules" });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) return NextResponse.json({ mode: "rules", error: "rate_limited" }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const messages = sanitize(body.messages);
  if (!messages.length) return NextResponse.json({ error: "empty" }, { status: 400 });

  try {
    const res = await fetch(process.env.ANTHROPIC_API_URL ?? "https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.CONCIERGE_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: 320,
        temperature: 0.3,
        system: systemPrompt(),
        messages,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return NextResponse.json({ mode: "rules" }, { status: 502 });
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.filter((c) => c.type === "text").map((c) => c.text).join("").trim();
    if (!text) return NextResponse.json({ mode: "rules" }, { status: 502 });
    return NextResponse.json({ mode: "llm", reply: text.slice(0, 900) });
  } catch {
    return NextResponse.json({ mode: "rules" }, { status: 502 });
  }
}
