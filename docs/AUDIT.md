# CP01 — Audit

## Situation
- Repository `marvinmcv-svg/Fogo-de-Chao-2-Bolivia` was **empty** (no commits, no branches). This is a ground-up build.
- The brief was written for a law firm. `fogodechao.bo` and the reference environment are the **Fogo de Chão Bolivia restaurant** (Boulevard · Ventura Mall, Santa Cruz de la Sierra). Decision (confirmed by the owner): redesign the restaurant site. Stack: Next.js + TypeScript.

## Existing site (fogodechao.bo) — ASP.NET MVC, Bootstrap + jQuery
| Route | Content |
|---|---|
| `/` | Video hero, "El arte de preparar carne", Market Table, Bar Fogo, "La tradición" |
| `/Fogos/Menu` | Categories only: Experiencia Churrasco, Platos a la carta, Cócteles tropicales, Postres, Bar Fogo, Vinos |
| `/Fogos/Ubicacion` | Ventura Mall, hours |
| `/Fogos/NuestraHistoria` | Brand story (Rio Grande do Sul → Porto Alegre → São Paulo → Dallas → NYC) |
| `/Fogos/Reservas` | **Restoo** booking iframe: `https://fogodechao.myrestoo.net/` |
| `/Fogos/Contactanos` | Name/surname/email/phone/comment + "Fogo eClub" opt-in |

Problems: Bootstrap-era layout, jQuery/skrollr/owl, 2023 footer copyright, generic type, no SEO metadata, no structured data, weak mobile hierarchy, tiny CTAs.

## Verified facts (safe to publish)
- Address: Boulevard del Centro Comercial Ventura Mall, Av. 4to Anillo esq. Av. San Martín S/N, Santa Cruz de la Sierra.
- Hours (Mon–Sun): Almuerzo 11:30–16:00 · Cena 19:00–23:00.
- Phones: 746-21200 (also WhatsApp, +591 74621200), 402-3155 (+591 3 4023155).
- Facebook `FogoBolivia`, Instagram `@fogodechao.bo`.
- Booking: Restoo `fogodechao.myrestoo.net`.
- Brand story paragraphs from `/Fogos/NuestraHistoria`.

## NOT verified — never published as fact
The reference environment shows prices (Bs 245/320/120), a 4.8★ rating, "+10k comensales", "+15k seguidores", "1979", named testimonials. None are on the official site. They are **omitted**; `src/lib/site.ts` has typed, empty slots (`prices`, `testimonials`, `stats`) that render nothing until filled.

## Media provenance
- **Owned (client site):** logo, `FogoHeaderVideo.mp4` (gauchos at the fire, 1280×720), fallback poster.
- **Client-branded vertical clips** (from reference env, carry "Fogo de Chão · Boulevard · Ventura Mall" end-card): used as vertical panels.
- **Reference-env photography:** 32 images of unknown licence; ~half are watermarked stock (Dreamstime/Shutterstock/Alamy) or carry third-party text/ads → excluded. A curated clean subset is used as **placeholder photography** and listed in `public/media/MANIFEST.md`. Replace with owned photography before launch.
- `grill-1.mp4` (generic stock) → excluded.

## Keep vs rebuild
Keep: URLs' intent (Menú/Ubicación/Historia/Reservas/Contacto), Restoo booking, WhatsApp pre-filled message, copy facts, logo, hero film. Rebuild: everything else.
