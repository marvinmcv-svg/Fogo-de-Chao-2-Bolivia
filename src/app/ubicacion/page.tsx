import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Visit } from "@/components/Visit";
import { Button } from "@/components/ui/Button";
import { Split } from "@/components/ui/Split";

export const metadata: Metadata = {
  title: "Ubicación y horarios",
  description: "Boulevard del Centro Comercial Ventura Mall, Av. 4to Anillo esq. Av. San Martín, Santa Cruz de la Sierra. Almuerzo 11:30–16:00 y cena 19:00–23:00, todos los días.",
  alternates: { canonical: "/ubicacion" },
};

export default function UbicacionPage() {
  return (
    <>
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
