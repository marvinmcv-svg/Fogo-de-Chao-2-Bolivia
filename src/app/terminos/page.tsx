import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Términos de uso", alternates: { canonical: "/terminos" } };

export default function TerminosPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title={"Términos\n*de uso.*"} />
      <section className="section prose" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="prose__body stack-m">
            <p>Este sitio ofrece información sobre Fogo de Chão Bolivia: menú, horarios, ubicación e historia. Al usarlo aceptas estos términos.</p>
            <h2 className="h3">Información</h2>
            <p>Hacemos lo posible por mantener la información actualizada, pero horarios, cortes y disponibilidad pueden cambiar sin previo aviso. Confirma con el restaurante cuando sea importante.</p>
            <h2 className="h3">Reservas</h2>
            <p>Las reservas se gestionan a través de Restoo o por WhatsApp. Una consulta enviada desde este sitio o a través del asistente no constituye una reserva hasta que el restaurante la confirme.</p>
            <h2 className="h3">Marcas y contenido</h2>
            <p>Fogo de Chão y sus logotipos son marcas de sus titulares. El contenido del sitio no puede reproducirse sin autorización.</p>
          </div>
        </div>
      </section>
    </>
  );
}
