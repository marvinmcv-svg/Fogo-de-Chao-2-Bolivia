import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <PageHero eyebrow="Error 404" title={"Esta brasa\n*ya se apagó.*"} lede="La página que buscas no existe o cambió de lugar." />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container btn-row">
          <Button href="/">Volver al inicio</Button>
          <Button href="/menu" variant="ghost" arrow={false}>Ver menú</Button>
        </div>
      </section>
    </>
  );
}
