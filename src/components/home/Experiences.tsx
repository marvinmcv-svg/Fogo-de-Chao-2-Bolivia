import Image from "next/image";
import { Split } from "../ui/Split";
import { Button } from "../ui/Button";

export function Experiences() {
  return (
    <section className="section light experiences" aria-labelledby="exp-title">
      <div className="container">
        <header className="experiences__head grid">
          <span className="eyebrow" data-fade>La mesa</span>
          <Split as="h2" className="h2" id="exp-title" text={"Más allá\nde la *brasa.*"} />
        </header>

        <div className="exp exp--a grid">
          <div className="exp__img mask" data-mask data-parallax="6">
            <Image src="/media/img/feijoada.webp" alt="Feijoada, arroz, farofa y verduras sobre la mesa" fill sizes="(min-width: 62rem) 46vw, 100vw" />
          </div>
          <div className="exp__txt stack-s">
            <span className="num meta" data-fade>01 · Market Table</span>
            <Split as="h3" className="h3" text="Una mesa que *no se vacía.*" />
            <p className="body" data-fade>
              Inspirada en las mesas del sur de Brasil, donde familias y amigos comparten lo mejor de sus cosechas:
              ensaladas de temporada, verduras frescas, quesos, panes y más.
            </p>
          </div>
        </div>

        <div className="exp exp--b grid">
          <div className="exp__txt stack-s">
            <span className="num meta" data-fade>02 · Bar Fogo</span>
            <Split as="h3" className="h3" text="Sabores de Brasil, *sin prisa.*" />
            <p className="body" data-fade>
              Un ambiente más casual para relajarse con amigos: cócteles artesanales, vinos seleccionados y platos pequeños
              inspirados en Brasil.
            </p>
            <div data-fade><Button href="/menu" variant="ghost">Explorar el menú</Button></div>
          </div>
          <div className="exp__img mask" data-mask data-parallax="6">
            <Image src="/media/img/caipirinha.webp" alt="Una caipirinha recién preparada en la barra" fill sizes="(min-width: 62rem) 40vw, 100vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
