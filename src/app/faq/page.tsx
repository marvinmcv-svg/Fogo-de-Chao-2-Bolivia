import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema, pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Accordion } from "@/components/faq/Accordion";
import { Button } from "@/components/ui/Button";
import { faqs, whatsappLink } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Preguntas frecuentes",
  description: "Horarios, ubicación, cómo funciona el rodizio, reservas y grupos en Fogo de Chão Bolivia.",
  path: "/faq",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={[faqSchema, breadcrumbSchema([{ name: "Preguntas frecuentes", path: "/faq" }])]} />
      <PageHero eyebrow="Preguntas frecuentes" title={"Antes de\n*venir.*"} lede="Lo esencial, con datos confirmados. Para lo demás, una persona del equipo te responde." />
      <section className="section faq" style={{ paddingTop: 0 }} data-tone="garnet">
        <div className="container faq__grid">
          <Accordion items={faqs} />
          <aside className="faq__aside stack-m" data-fade>
            <p className="lede">¿Tu pregunta no está aquí?</p>
            <div className="btn-row">
              <Button href={whatsappLink("Hola, tengo una consulta sobre Fogo de Chão.")}>Escribir por WhatsApp</Button>
              <button type="button" className="link" data-concierge>Preguntar al concierge</button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
