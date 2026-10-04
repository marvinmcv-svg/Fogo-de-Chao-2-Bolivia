import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema, pageMeta } from "@/lib/seo";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Split } from "@/components/ui/Split";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = pageMeta({ title: "Nuestra historia", description: "De la Sierra Gaucha, en el sur de Brasil, a Santa Cruz de la Sierra: la historia de Fogo de Chão y la tradición del churrasco.", path: "/historia" });

const chapters = [
  { place: "Sierra Gaucha", text: "Los fundadores de Fogo de Chão crecieron en una granja tradicional en el sur de Brasil, en la Sierra Gaucha. Allí aprendieron a cocinar en la tradición del churrasco, que se convertiría en la columna vertebral de su historia." },
  { place: "Río de Janeiro y São Paulo", text: "Los hermanos fundadores dejaron el pintoresco campo de Rio Grande del Sur para formarse como churrasqueros en Río de Janeiro y São Paulo, mientras tomaba forma el concepto de Fogo." },
  { place: "Porto Alegre", text: "El primer restaurante, con estructura de madera y a las afueras de Porto Alegre, surgió de una obsesión por la calidad, inversiones en el arte y la cultura de la ciudad, y respeto por el patrimonio de las familias fundadoras." },
  { place: "São Paulo", text: "Tras ganarse una reputación entre políticos, empresarios y celebridades que viajaban desde todo Brasil para probar la experiencia, Fogo abrió su segundo restaurante en São Paulo." },
  { place: "Dallas", text: "A pedido de sus fieles huéspedes estadounidenses, el concepto viajó a los Estados Unidos y debutó en Dallas, Texas. Entre 1997 y 2013 la expansión continuó en Brasil y Estados Unidos, con 29 restaurantes nuevos." },
  { place: "Nueva York", text: "Justo antes de la Navidad de 2013, Fogo inauguró una ubicación emblemática de tres pisos en Nueva York. Su diseño incluye una escultura en bajorrelieve de diecisiete pies creada por Antonio Caringi: “O Laçador”, monumento histórico de Porto Alegre." },
  { place: "Bar Fogo", text: "El equipo culinario siguió desarrollando platos arraigados en la tradición brasileña. En 2013 llegaron los mariscos y, más tarde ese año, nació Bar Fogo: porciones pequeñas inspiradas en Brasil, vinos galardonados y cócteles." },
  { place: "Santa Cruz de la Sierra", text: "Hoy la brasa arde en el Boulevard del Ventura Mall. El viaje no ha terminado: Fogo sigue presentando nuevos sabores y experiencias a audiencias de todo el mundo." },
];

export default function HistoriaPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Nuestra historia", path: "/historia" }])} />
      <PageHero eyebrow="Nuestra historia" title={"La rica tradición\n*del churrasco.*"} lede="De una granja en la Sierra Gaucha a la mesa de Santa Cruz." />
      <section className="section hist">
        <div className="container hist__grid">
          <aside className="hist__aside">
            <div className="hist__film mask" data-mask>
              <Image src="/media/img/rodizio-poster.webp" alt="" fill sizes="(min-width: 62rem) 28vw, 80vw" />
              <LazyVideo src="/media/video/rodizio-vertical.mp4" />
            </div>
          </aside>
          <ol className="hist__list">
            {chapters.map((c, i) => (
              <li key={c.place} className="chapter">
                <span className="num meta">{String(i + 1).padStart(2, "0")}</span>
                <Split as="h2" className="h2 chapter__place" text={c.place} />
                <p className="body" data-fade>{c.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section">
        <div className="container stack-m">
          <Split as="h2" className="h2" text={"Vive la tradición\n*en tu mesa.*"} />
          <Button href="/reservas">Reservar mesa</Button>
        </div>
      </section>
    </>
  );
}
