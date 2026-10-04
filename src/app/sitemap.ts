import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/menu", priority: 0.9, changeFrequency: "monthly" },
  { path: "/reservas", priority: 0.9, changeFrequency: "monthly" },
  { path: "/eventos", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/ubicacion", priority: 0.8, changeFrequency: "yearly" },
  { path: "/historia", priority: 0.6, changeFrequency: "yearly" },
  { path: "/contacto", priority: 0.7, changeFrequency: "yearly" },
  { path: "/privacidad", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terminos", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({ url: `${site.url}${r.path}`, changeFrequency: r.changeFrequency, priority: r.priority }));
}
