// Usage: node scripts/shots.mjs <url-path> [name] [--full]  → qa-shots/<name>-{desktop,mobile}.png
import { chromium } from "playwright-core";
import { mkdirSync, readdirSync } from "node:fs";

const base = process.env.BASE ?? "http://localhost:3000";
const [, , p = "/", name = "shot", ...flags] = process.argv;
const full = flags.includes("--full");
mkdirSync("qa-shots", { recursive: true });
const dir = "/opt/pw-browsers";
const chrome = readdirSync(dir).find((d) => d.startsWith("chromium-"));
const executablePath = chrome ? `${dir}/${chrome}/chrome-linux/chrome` : `${dir}/chromium`;
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const errors = [];
for (const [label, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errors.push(`[${label}] ${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`[${label}] pageerror: ${e.message}`));
  await page.goto(base + p, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2200);
  if (full) {
    // scroll through to trigger reveals
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(250); }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600);
  }
  await page.screenshot({ path: `qa-shots/${name}-${label}.png`, fullPage: full });
  await ctx.close();
}
await browser.close();
console.log(errors.length ? errors.join("\n") : "no console errors");
