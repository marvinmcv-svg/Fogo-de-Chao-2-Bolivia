/**
 * Single source of truth for facts about the restaurant.
 * Everything here is either verified on fogodechao.bo or marked `null`/empty.
 * Empty slots (prices, stats, testimonials) render nothing until filled by the owner.
 */

export const site = {
  name: "Fogo de Chão Bolivia",
  short: "Fogo de Chão",
  location: "Boulevard · Ventura Mall",
  city: "Santa Cruz de la Sierra",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fogodechao.bo",
  locale: "es_BO",
  description:
    "Rodizio brasileño en Santa Cruz de la Sierra. Cortes tallados a la mesa sobre brasas vivas, Market Table y Bar Fogo en el Boulevard del Ventura Mall.",
  address: {
    line1: "Boulevard del Centro Comercial Ventura Mall",
    line2: "Av. 4to Anillo esq. Av. San Martín S/N",
    city: "Santa Cruz de la Sierra",
    country: "Bolivia",
    countryCode: "BO",
  },
  phones: {
    whatsapp: { display: "746 21200", e164: "59174621200" },
    landline: { display: "402 3155", e164: "59134023155" },
  },
  /** Same hours every day of the week (as published on the official site). */
  hours: [
    { label: "Almuerzo", open: "11:30", close: "16:00" },
    { label: "Cena", open: "19:00", close: "23:00" },
  ],
  social: {
    instagram: "https://www.instagram.com/fogodechao.bo/",
    facebook: "https://www.facebook.com/FogoBolivia",
  },
  /** Restoo remains the booking system of record. */
  booking: "https://fogodechao.myrestoo.net/",
  mapsQuery: "Fogo de Chão Santa Cruz de la Sierra Ventura Mall Boulevard",
  /** Unverified claims: leave empty/null until the owner supplies real figures. */
  prices: null as null | { label: string; hours: string; price: string; includes: string[] }[],
  stats: [] as { value: string; label: string }[],
  testimonials: [] as { quote: string; author: string; context?: string }[],
} as const;

export const nav = [
  { href: "/menu", label: "Menú" },
  { href: "/historia", label: "Historia" },
  { href: "/ubicacion", label: "Ubicación" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(site.mapsQuery)}&output=embed`;
export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`;

export function whatsappLink(message = "Hola, me gustaría hacer una reserva en Fogo de Chão.") {
  return `https://wa.me/${site.phones.whatsapp.e164}?text=${encodeURIComponent(message)}`;
}

export const telLink = (e164: string) => `tel:+${e164}`;

/** Verified menu sections (names from the official site). Copy is descriptive only; no prices. */
export const menuSections = [
  {
    id: "churrasco",
    name: "Experiencia Churrasco",
    blurb:
      "El rodizio: cortes servidos en espada, tallados a tu mesa por los gaúchos, tantas veces como quieras.",
    image: "/media/img/carving-table.webp",
  },
  {
    id: "a-la-carta",
    name: "Platos a la carta",
    blurb: "Para quien prefiere elegir un plato y quedarse en él.",
    image: "/media/img/feijoada.webp",
  },
  {
    id: "cocteles",
    name: "Cócteles tropicales",
    blurb: "Coctelería brasileña, empezando por la caipirinha.",
    image: "/media/img/caipirinha.webp",
  },
  {
    id: "postres",
    name: "Postres",
    blurb: "El cierre de la mesa.",
    image: "/media/img/postre.webp",
  },
  {
    id: "bar-fogo",
    name: "Bar Fogo",
    blurb: "Platos pequeños inspirados en Brasil, cócteles y vinos, en un ambiente más casual.",
    image: "/media/img/pao-de-queijo.webp",
  },
  {
    id: "vinos",
    name: "Vinos",
    blurb: "Una selección para acompañar la brasa.",
    image: "/media/img/steak-sear.webp",
  },
] as const;

export const cuts = [
  {
    name: "Picanha",
    note: "La tapa del lomo, con su capa de grasa dorada al fuego.",
    image: "/media/img/picanha-roast.webp",
  },
  {
    name: "Fraldinha",
    note: "Bife de vacío: veteado intenso, sabor profundo.",
    image: "/media/img/flank.webp",
  },
  {
    name: "Costela",
    note: "Costillar cocinado lento sobre brasas hasta soltarse del hueso.",
    image: "/media/img/ribs-carving.webp",
  },
  {
    name: "Alcatra",
    note: "Lomo asado entero en espada y cortado en rebanadas.",
    image: "/media/img/sliced-cut.webp",
  },
  {
    name: "Linguiça",
    note: "Chorizo brasileño, flameado hasta que la piel cruje.",
    image: "/media/img/linguica.webp",
  },
] as const;

export const ritual = [
  {
    n: "01",
    title: "Siéntate",
    text: "Recibes un token de dos caras. En verde, los cortes no se detienen.",
    state: "sim",
  },
  {
    n: "02",
    title: "Elige",
    text: "Los gaúchos pasan con la espada en llamas. Tú decides qué corte y en qué punto.",
    state: "sim",
  },
  {
    n: "03",
    title: "Disfruta",
    text: "Se talla sobre tu plato, al momento. Una y otra vez.",
    state: "sim",
  },
  {
    n: "04",
    title: "Pausa",
    text: "Gira el token a rojo para conversar o visitar la Market Table. Vuelve a verde cuando quieras más.",
    state: "nao",
  },
] as const;

export const story = [
  "Los fundadores de Fogo de Chão crecieron en una granja tradicional del sur de Brasil, en la Sierra Gaucha. Allí aprendieron a cocinar en la tradición del churrasco.",
  "Dejaron el campo de Rio Grande del Sur para formarse como churrasqueros en Río de Janeiro y São Paulo. El primer restaurante, de estructura de madera, nació en Porto Alegre, de una obsesión por la calidad y el respeto por la herencia de las familias fundadoras.",
  "De Porto Alegre a São Paulo, y por pedido de sus huéspedes, a Dallas y a Nueva York. Hoy la brasa llega a Santa Cruz de la Sierra, al Boulevard del Ventura Mall.",
] as const;
