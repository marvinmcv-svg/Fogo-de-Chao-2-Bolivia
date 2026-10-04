// node scripts/axe.mjs  → runs axe-core (WCAG 2.2 A/AA + best-practice) on every route, desktop + mobile
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const axeSrc = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const base = process.env.BASE ?? "http://localhost:3000";
const routes = ["/", "/menu", "/historia", "/ubicacion", "/reservas", "/contacto", "/eventos", "/faq", "/privacidad", "/terminos", "/no-existe"];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
let total = 0;
for (const [label, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  for (const r of routes) {
    await p.goto(base + r, { waitUntil: "load", timeout: 60000 });
    await p.waitForTimeout(1800);
    // scroll through so reveals complete (axe contrast needs final colours)
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 600) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(120); }
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1500);
    await p.addScriptTag({ content: axeSrc });
    const res = await p.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } })).violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes.slice(0, 2).map((n) => n.target.join(" ") + " :: " + (n.failureSummary || "").split("\n").slice(1, 3).join(" ").slice(0, 160)) })));
    total += res.length;
    console.log(`[${label}] ${r} → ${res.length ? "" : "clean"}`);
    for (const v of res) console.log(`    ${v.impact} ${v.id} (${v.n})\n      ${v.sample.join("\n      ")}`);
  }
  await ctx.close();
}
await b.close();
console.log("TOTAL violations:", total);
