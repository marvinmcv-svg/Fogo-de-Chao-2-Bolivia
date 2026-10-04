// node scripts/sections.mjs <path> <selector,selector,...> [desktop|mobile]  → qa-shots/sec-<n>-<mode>.png
import { chromium } from "playwright-core";
const [, , p = "/", sels = "", mode = "desktop"] = process.argv;
const vp = mode === "mobile" ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: vp, isMobile: mode === "mobile", hasTouch: mode === "mobile" });
const page = await ctx.newPage();
await page.goto((process.env.BASE ?? "http://localhost:3000") + p, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(2500);
let i = 0;
for (const s of sels.split(",").filter(Boolean)) {
  const [sel, offset = "0"] = s.split("@");
  const y = await page.evaluate(([sel, off]) => { const el = document.querySelector(sel); if (!el) return -1; return el.getBoundingClientRect().top + window.scrollY + Number(off); }, [sel, offset]);
  if (y < 0) { console.log("missing", sel); continue; }
  // scroll gradually so scrubbed/pinned triggers resolve
  const cur = await page.evaluate(() => window.scrollY);
  const steps = 8;
  for (let k = 1; k <= steps; k++) { await page.evaluate((v) => window.scrollTo(0, v), cur + ((y - cur) * k) / steps); await page.waitForTimeout(90); }
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `qa-shots/sec-${i}-${mode}.png` });
  console.log(i, sel, offset);
  i++;
}
await b.close();
