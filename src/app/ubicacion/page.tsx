import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema, pageMeta, restaurantSchema } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Visit } from "@/components/Visit";
import { Button } from "@/components/ui/Button";
import { Split } from "@/components/ui/Split";

export const metadata: Metadata = pageMeta({ title: "Ubicación y horarios", description: "Boulevard del Centro Comercial Ventura Mall, Av. 4to Anillo esq. Av. San Martín, Santa Cruz de la Sierra. Almuerzo de 11:30 a 16:00 y cena de 19:00 a 23:00, todos los días.", path: "/ubicacion" });

export default function UbicacionPage() {
  return (
    <>
      <JsonLd data={restaurantSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Ubicación y horarios", path: "/ubicacion" }])} />
      <PageHero eyebrow="Ubicación" title={"En el corazón\n*del Ventura Mall.*"} lede="Boulevard del Centro Comercial, sobre el 4to Anillo." />
      <Visit heading="Cómo *encontrarnos.*" />
      <section className="section">
        <div className="container stack-m">
          <Split as="h2" className="h2" text={"Tu mesa\n*te espera.*"} />
          <Button href="/reservas">Reservar mesa</Button>
        </div>
      </section>
    </>
  );
}
