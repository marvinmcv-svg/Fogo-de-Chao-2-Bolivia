import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.short,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0d0a08",
    theme_color: "#0d0a08",
    lang: "es-BO",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
  };
}
