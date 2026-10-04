import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { MenuIndex } from "@/components/menu/MenuIndex";
import { Split } from "@/components/ui/Split";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Menú",
  description: "Experiencia Churrasco, platos a la carta, cócteles tropicales, postres, Bar Fogo y vinos en Fogo de Chão Bolivia.",
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <>
      <PageHero eyebrow="Nuestro menú" title={"Una muestra\n*del sur de Brasil.*"} lede="Seis maneras de recorrer la mesa." />
      <MenuIndex />
      <section className="section">
        <div className="container stack-m">
          <Split as="h2" className="h2" text={"¿Quieres ver\n*el menú completo?*"} />
          <p className="body" data-fade>Precios, disponibilidad y opciones para grupos o celebraciones: pregúntanos y te respondemos por WhatsApp.</p>
          <div className="btn-row" data-fade>
            <Button href={whatsappLink("Hola, me gustaría conocer el menú y los precios de Fogo de Chão.")}>Consultar por WhatsApp</Button>
            <Button href="/reservas" variant="ghost">Reservar mesa</Button>
            <button type="button" className="link" data-concierge>Preguntar al concierge</button>
          </div>
        </div>
      </section>
    </>
  );
}
