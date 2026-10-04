# Fogo de Chão Bolivia — website

Editorial, cinematic redesign of [fogodechao.bo](https://fogodechao.bo) (Boulevard · Ventura Mall, Santa Cruz de la Sierra).
Next.js 16 · React 19 · TypeScript · GSAP + Lenis · three (one lazy WebGL layer) · plain CSS with design tokens.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

## What's here

| Route | Purpose |
|---|---|
| `/` | Hero film → manifesto → **rodizio token** (flips green/red) → **pinned cuts rail** → Market Table / Bar Fogo → story → visit |
| `/menu` | Six verified menu sections as a typographic index (no prices; see below) |
| `/historia` | Official brand story as chapters |
| `/ubicacion` | Address, hours, live "open now" (Bolivia time), map |
| `/reservas` | Restoo booking iframe (the existing system of record) + WhatsApp/phone |
| `/eventos` | Groups and celebrations: occasions + event lead form (date, party size) |
| `/faq` | Accordion with verified answers + FAQPage JSON-LD |
| `/contacto` | Accessible lead form |
| `/privacidad`, `/terminos` | Plain-language legal pages |

Home also has a **quick-reservation bar** (date, party size, service → Restoo or a pre-written WhatsApp), a scroll-velocity **marquee**, a pinned **zoom-parallax gallery** and a **sticky stack** of gradient panels.

Site-wide: **Concierge** (guided in-chat booking request, voice input, basic English, one dismissible nudge per session) + **WhatsApp widget** (live open/closed status, one-tap pre-written messages), page-aware pre-filled WhatsApp message, curtain page transitions, sitemap/robots/manifest/JSON-LD.

Design direction ("Brasa") is in [`docs/DESIGN.md`](docs/DESIGN.md); the audit of the original site is in [`docs/AUDIT.md`](docs/AUDIT.md).

## Configuration (`.env.example`)

| Variable | Effect when unset |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Defaults to `https://fogodechao.bo` |
| `LEAD_WEBHOOK_URL` | Forms/concierge leads can't be delivered server-side → the UI falls back to a **pre-filled WhatsApp message** (no lead is silently dropped). Any Slack/Discord-style incoming webhook, Zapier, Make or n8n URL works. |
| `ANTHROPIC_API_KEY` | Concierge uses its built-in, fact-grounded rules and hands anything else to a person. With a key, free-text questions are answered by Claude under a strict grounding prompt (`src/lib/concierge.ts → systemPrompt`). |

## Content integrity — please read before launch

The brief was written for a law firm; the project is the Fogo de Chão **restaurant**, so the law-specific parts (attorneys, practice areas, legal-advice guardrails) were adapted, not built. A few decisions to know about:

- **Only verified facts are published** (`src/lib/site.ts`): address, hours (11:30–16:00 and 19:00–23:00, every day), phones, social links, Restoo link, brand story, menu *section names* — all from fogodechao.bo.
- **Not published** because they're not on the official site: prices (Bs 245/320/120), the 4.8★ rating, "+10k comensales", follower counts, "since 1979", named testimonials. `site.ts` has typed empty slots (`prices`, `stats`, `testimonials`); fill them with real figures and the UI is ready to render them. The same goes for structured data: no `aggregateRating`, `priceRange` or `geo` until real values exist.
- **Photography is placeholder.** The client-owned assets (logo, hero film, favicon mark) are used as-is. The 14 stills come from the reference environment, their licence is unknown, and watermarked stock images were excluded. See [`public/media/MANIFEST.md`](public/media/MANIFEST.md) — **replace them with owned photography**.
- **Cuts list** (Picanha, Fraldinha, Costela, Alcatra, Linguiça) comes from the reference environment, not the official site. Please confirm it matches what is served.
- **Legal pages** are short plain-language summaries of what this site actually does; have them reviewed by counsel.
- The official menu page lists section names only. If there is a PDF/photo menu, drop it into `/menu` (the CTA currently routes to WhatsApp).

## Concierge guardrails

It identifies as an automatic assistant, never confirms reservations, never invents prices/availability/policies, and routes allergens, children, parking, dress code, delivery, prices and promotions to the team (WhatsApp/phone). Lead capture inside the chat posts to `/api/contact`.

## Verification performed

- `next build`, ESLint, `tsc --noEmit`: clean.
- **axe-core** (WCAG 2.2 A/AA + best-practice): 0 violations on 9 routes × desktop/mobile, plus open menu, open concierge, and form-error states.
- **Lighthouse (mobile profile, local prod build, `/`)**: Performance 99 · Accessibility 100 · Best Practices 100 · SEO 100 (LCP 2.0 s, CLS 0.016, 378 KB transferred).
- Route × viewport sweep (320/390/768/1024/1440/1920 px + reduced motion): no horizontal overflow, broken images, console errors, unrevealed content or dead internal links.
- Keyboard: skip link, menu focus trap/Escape, concierge focus return, first-invalid-field focus, rail focus-follow.
- Concierge rules table (19 phrasings) and the LLM route (headers, model, message sanitising) against a mock Anthropic endpoint.

### Not verified (sandbox limits)
- The **Restoo iframe and Google Map** couldn't load (outbound network blocked) — the layout and a "Ver en Google Maps" / "Abrir reservas" fallback are in place, but test both on the real domain.
- The **LLM concierge against the live Anthropic API** (needs a key); only the request/response contract was tested.
- **Real devices.** WebGL ran on a software renderer; video autoplay was checked structurally (the sandbox Chromium lacks H.264). Please check iOS Safari and a mid-range Android.
- Lighthouse was measured locally, not on production hosting/CDN.

## Motion & performance notes

- Above-the-fold entrances are pure CSS so LCP never waits on JS; below-the-fold reveals use GSAP ScrollTrigger.
- Everything respects `prefers-reduced-motion` (no smooth scroll, no transitions, no film, no embers, native snap rail).
- Videos load only near the viewport (hero: after `load` + idle) and are skipped for Save-Data/2G. `three` is dynamically imported on idle, desktop-capable devices only.
- `npm run media` regenerates optimised media from originals (`MEDIA_SRC=<folder>`; needs `ffmpeg`).

## Suggested next steps
1. Replace placeholder photography; confirm cuts list and menu.
2. Set `LEAD_WEBHOOK_URL` (and optionally `ANTHROPIC_API_KEY`), then test a real lead end-to-end.
3. Supply real prices/ratings/testimonials only if the owner can stand behind them.
4. Add a Content-Security-Policy once the final third-party list is fixed (Restoo, Google Maps).

## Luxe upgrade (this release)

- **Look:** Bodoni Moda display type, fire-gradient aurora that re-tints per section, film grain, glass double-bezel surfaces, spotlight borders. Taste-skill rules applied: no custom cursor, no em-dashes, no scroll cue, no section numbering, one radius system, one accent.
- **3D:** a physically shaded WebGL rodizio token that flips green/red with the ritual steps (pointer tilt, scroll spin); a domain-warped fire shader under the hero embers; 3D page-turn on the cuts rail; tilt cards.
- **GSAP:** sticky stack, zoom parallax, velocity marquee, drawn progress line, text scramble nav, hero pointer depth, magnetic buttons. All gated by `prefers-reduced-motion`; WebGL is lazy and falls back to CSS.
- **Not added (needs owner input):** newsletter/loyalty, gift cards, reviews/press, language toggle. Testimonials and ratings stay empty until real.
- Market study note: the brief mentioned law firms; premium steakhouse/churrascaria patterns were used instead (quick booking, events, FAQ, WhatsApp, structured data).
