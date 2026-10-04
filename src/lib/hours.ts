import { site } from "./site";

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export type OpenStatus = { open: boolean; text: string };

/** Status in Bolivia time (America/La_Paz, UTC−4, no DST). Same hours every day. */
export function openStatus(now: Date = new Date()): OpenStatus {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/La_Paz", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const cur = h * 60 + m;

  for (const s of site.hours) {
    if (cur >= toMin(s.open) && cur < toMin(s.close)) {
      return { open: true, text: `Abierto ahora · ${s.label.toLowerCase()} hasta las ${s.close}` };
    }
  }
  const next = site.hours.find((s) => cur < toMin(s.open)) ?? site.hours[0];
  const tomorrow = cur >= toMin(site.hours[site.hours.length - 1].close);
  return { open: false, text: `Cerrado · abrimos ${tomorrow ? "mañana " : ""}a las ${next.open}` };
}
