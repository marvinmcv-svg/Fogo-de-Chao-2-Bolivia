import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import "@/styles/home.css";
import "@/styles/pages.css";
import "@/styles/luxe.css";
import "@/styles/concierge.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Motion } from "@/components/Motion";
import { Transition } from "@/components/Transition";
import { Aurora } from "@/components/Aurora";
import { Concierge } from "@/components/concierge/Concierge";
import { site } from "@/lib/site";
import { JsonLd, websiteSchema } from "@/lib/seo";

// Latin subset only (covers ñ á é í ó ú ã ç ¿ ¡). next/font preloads these and generates a size-matched fallback to avoid layout shift.
const display = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-opsz-normal.woff2", weight: "400 900", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-opsz-italic.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--font-display-face",
  display: "swap",
  fallback: ["Times New Roman", "serif"],
});
const sans = localFont({
  src: "../../node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-sans-face",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · Rodizio brasileño en Santa Cruz`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.name, locale: site.locale, url: "/", title: `${site.name} · Rodizio brasileño en Santa Cruz`, description: site.description },
  twitter: { card: "summary_large_image", title: `${site.name} · Rodizio brasileño en Santa Cruz`, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0d0a08",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <Aurora />
        <a className="skip-link" href="#main">Saltar al contenido</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <JsonLd data={websiteSchema()} />
        <Motion />
        <Transition />
        <Concierge />
      </body>
    </html>
  );
}
