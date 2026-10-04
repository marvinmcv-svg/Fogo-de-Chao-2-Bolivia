# Design direction — "Brasa"

**Idea:** an editorial, after-dark dining room lit only by fire. The site is dark charcoal; light comes from ember. Hospitality-editorial, not "steakhouse template".

## Research takeaways (premium hospitality / steakhouse sites, Awwwards-style restaurant work)
- Winners lead with one full-bleed film and one sentence; navigation stays out of the way; the reservation CTA is persistent and the *only* loud element.
- Menus are typographic, never card grids; prices/hours live in quiet tabular layouts.
- Motion is slow and material: masked image reveals, line-by-line headlines, scrub-linked scale; no bouncy UI.
- Law-firm references in the brief (Freshfields etc.) were studied for restraint and information hierarchy, not copied; they translate to: generous whitespace, one accent, small-caps metadata, strong grid.
- Taste-skill principles applied: anti-slop (no gradient blobs, no icon-card rows, no generic centred hero), DESIGN_VARIANCE 8 (asymmetric grid), MOTION_INTENSITY 7 (GSAP scroll + masks, calm), VISUAL_DENSITY 3 (airy).

## Palette (no navy/gold)
| Token | Value | Use |
|---|---|---|
| `--char` | `#0d0a08` | page |
| `--coal` | `#17120f` | raised surfaces |
| `--ash` | `#2a221d` | hairlines, panels |
| `--bone` | `#efe6d6` | text, light sections |
| `--smoke` | `#a89c8c` | secondary text (AA on char) |
| `--ember` | `#e8561c` | the single accent (CTAs, active) |
| `--sim` / `--nao` | `#2f7d4f` / `#b3261e` | the rodizio token: green/red, used only in the Ritual section |

## Type
- Display: **Instrument Serif** (large, tight, italic for emphasis words).
- Text/UI: **Hanken Grotesk** variable. Metadata in small uppercase with tracking.
- Fluid scale via `clamp()`; display 4.5–11rem only in hero/section openers.

## Information architecture
`/` Inicio · `/menu` · `/historia` · `/ubicacion` · `/reservas` · `/contacto` · `/privacidad` · `/terminos`.
Persistent: reservation CTA (header), WhatsApp (quiet corner pill → Concierge sheet), footer with hours/address.

## Home narrative
1. Hero film + "El fuego no se apaga." + Reservar / Ver menú
2. Manifesto (scrub-revealed words)
3. El Ritual: sticky section, green/red token flips as you scroll through 4 steps
4. Cortes: horizontal pinned rail (typographic list + masked images)
5. Market Table + Bar Fogo (asymmetric split)
6. Historia teaser (vertical film panel)
7. Visit: address/hours/map + reservation CTA
8. Footer

## Conversion
Restoo stays the booking system of record. Concierge (AI-style receptionist) handles FAQs, hours, directions, occasion capture and hands off to Restoo / WhatsApp with a pre-filled message. Never invents prices or availability.

## 3D
One tasteful WebGL layer: rising embers (instanced points, custom shader) behind the hero; desktop-only, lazy, killed under reduced-motion / low-power, CSS ember fallback.
