import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Política de privacidad", alternates: { canonical: "/privacidad" } };

export default function PrivacidadPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title={"Política de\n*privacidad.*"} />
      <section className="section prose" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="prose__body stack-m">
            <p>Este sitio es operado por Fogo de Chão Bolivia ({site.location}, {site.city}). Esta política describe qué datos recopilamos y para qué.</p>
            <h2 className="h3">Qué datos recopilamos</h2>
            <p>Solo los que tú nos entregas: nombre, teléfono, correo (opcional) y el mensaje que escribes en el formulario de contacto o en el asistente del sitio. No recopilamos datos de pago.</p>
            <h2 className="h3">Para qué los usamos</h2>
            <p>Para responder tu consulta, gestionar tu reserva o contactarte sobre tu solicitud. No vendemos tus datos.</p>
            <h2 className="h3">Reservas en línea</h2>
            <p>Las reservas en línea se procesan en la plataforma Restoo, que tiene su propia política de privacidad.</p>
            <h2 className="h3">WhatsApp y servicios de terceros</h2>
            <p>Si eliges escribirnos por WhatsApp o ver el mapa de Google, esos servicios aplican sus propias políticas. Este sitio incluye mapas de Google y reservas de Restoo como contenido incrustado.</p>
            <h2 className="h3">Tus derechos</h2>
            <p>Puedes pedirnos que corrijamos o eliminemos tus datos escribiéndonos por WhatsApp al {site.phones.whatsapp.display} o llamando al {site.phones.landline.display}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
