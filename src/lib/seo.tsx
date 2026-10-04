import type { Metadata } from "next";
import { site } from "./site";

/** Per-page metadata with matching canonical, Open Graph and Twitter fields (the OG image comes from app/opengraph-image). */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const url = path === "/" ? "/" : path;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} · ${site.name}`, description, url, siteName: site.name, locale: site.locale, type: "website" },
    twitter: { card: "summary_large_image", title: `${title} · ${site.name}`, description },
  };
}

/** Serialises JSON-LD safely for inline <script> (escapes "<" so content can never close the tag). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Restaurant entity. Only verified facts are included: no priceRange, no aggregateRating and no geo coordinates
 * until the owner supplies real values (fabricated structured data can trigger manual actions).
 */
export function restaurantSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${site.url}/#restaurant`,
    name: site.name,
    url: site.url,
    image: `${site.url}/opengraph-image.png`,
    logo: `${site.url}/media/brand/fogo-logo-white.png`,
    description: site.description,
    servesCuisine: ["Brasileña", "Churrasco", "Rodizio"],
    telephone: `+${site.phones.landline.e164}`,
    acceptsReservations: true,
    hasMenu: `${site.url}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      addressCountry: site.address.countryCode,
    },
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayNames,
      opens: h.open,
      closes: h.close,
    })),
    potentialAction: { "@type": "ReserveAction", target: { "@type": "EntryPoint", urlTemplate: `${site.url}/reservas`, actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"] }, result: { "@type": "Reservation", name: "Reserva de mesa" } },
    sameAs: [site.social.instagram, site.social.facebook],
  };
}

export function websiteSchema() {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, inLanguage: "es-BO", publisher: { "@id": `${site.url}/#restaurant` } };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Inicio", path: "/" }, ...items].map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path === "/" ? "" : it.path}` })),
  };
}
