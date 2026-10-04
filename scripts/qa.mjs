// node scripts/qa.mjs → route × viewport sweep: overflow, broken media, console errors, dead links, h1 count
import { chromium } from "playwright-core";
const base = process.env.BASE ?? "http://localhost:3000";
const routes = ["/", "/menu", "/historia", "/ubicacion", "/reservas", "/contacto", "/privacidad", "/terminos", "/ruta-inexistente"];
const widths = [320, 390, 768, 1024, 1440, 1920];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const problems = [], links = new Set();
for (const reduce of [false, true]) {
  for (const w of widths) {
    if (reduce && ![390, 1440].includes(w)) continue;
    const ctx = await b.newContext({ viewport: { width: w, height: w < 700 ? 800 : 900 }, reducedMotion: reduce ? "reduce" : "no-preference", isMobile: w < 700, hasTouch: w < 700 });
    const p = await ctx.newPage();
    const errs = [];
    p.on("console", (m) => { if (m.type() === "error" && !/501|ReadPixels/.test(m.text())) errs.push(m.type() + ": " + m.text()); });
    p.on("pageerror", (e) => errs.push("PAGEERR " + e.message));
    p.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("/ruta-inexistente")) errs.push(`HTTP ${r.status()} ${r.url()}`); });
    for (const r of routes) {
      errs.length = 0;
      const res = await p.goto(base + r, { waitUntil: "load", timeout: 60000 });
      await p.waitForTimeout(1200);
      const h = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 700) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(90); }
      await p.waitForTimeout(600);
      const info = await p.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const over = [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > vw + 2 && !e.closest(".cuts__track, .sheet, .embers, .menu, .curtain, .hero__media, [data-parallax], .mask"); }).slice(0, 3).map((e) => e.className?.toString().slice(0, 40) || e.tagName);
        return {
          scrollOverflow: document.documentElement.scrollWidth > vw + 1,
          over,
          broken: [...document.images].filter((i) => i.offsetParent !== null && i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc.slice(-50)),
          h1: document.querySelectorAll("h1").length,
          hidden: [...document.querySelectorAll("[data-split]:not([data-intro]):not(.is-in), [data-fade]:not([data-intro]):not(.is-in), [data-mask]:not(.is-in)")].filter((e) => getComputedStyle(e).visibility !== "hidden" && e.getBoundingClientRect().top < innerHeight * 2).length,
          links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
        };
      });
      info.links.forEach((l) => links.add(l));
      const tag = `[${w}${reduce ? " reduced" : ""}] ${r}`;
      if (r !== "/ruta-inexistente" && res.status() !== 200) problems.push(`${tag}: status ${res.status()}`);
      if (r === "/ruta-inexistente" && res.status() !== 404) problems.push(`${tag}: expected 404 got ${res.status()}`);
      if (info.scrollOverflow) problems.push(`${tag}: horizontal page overflow ${info.over.join(",")}`);
      if (info.broken.length) problems.push(`${tag}: broken images ${info.broken.join(",")}`);
      if (info.h1 !== 1) problems.push(`${tag}: ${info.h1} h1`);
      if (!reduce && info.hidden) problems.push(`${tag}: ${info.hidden} reveal elements never revealed`);
      const real = r === "/ruta-inexistente" ? errs.filter((e) => !/404/.test(e)) : errs;
      errs.length = 0; errs.push(...real);
      if (errs.length) problems.push(`${tag}: ${[...new Set(errs)].slice(0, 3).join(" | ")}`);
    }
    await ctx.close();
  }
}
// link check
const internal = [...links].filter((l) => l.startsWith("/") && !l.startsWith("//")).map((l) => l.split("#")[0] || "/");
for (const l of new Set(internal)) { const r = await fetch(base + l); if (r.status !== 200) problems.push(`link ${l} → ${r.status}`); }
const ext = [...links].filter((l) => /^(https?:|tel:|mailto:)/.test(l));
console.log("external/tel links in use:\n  " + [...new Set(ext)].map((l) => decodeURIComponent(l).slice(0, 110)).join("\n  "));
console.log("internal links checked:", new Set(internal).size);
console.log(problems.length ? "PROBLEMS:\n" + problems.join("\n") : "QA SWEEP CLEAN");
await b.close();
