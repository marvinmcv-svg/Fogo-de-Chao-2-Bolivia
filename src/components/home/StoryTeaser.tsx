import Image from "next/image";
import { LazyVideo } from "../ui/LazyVideo";
import { Split } from "../ui/Split";
import { Button } from "../ui/Button";

export function StoryTeaser() {
  return (
    <section className="section story" aria-labelledby="story-title" data-tone="garnet">
      <div className="container grid">
        <div className="story__film mask" data-mask>
          <Image src="/media/img/story-poster.webp" alt="" fill sizes="(min-width: 62rem) 30vw, 80vw" />
          <LazyVideo src="/media/video/fuego-vertical.mp4" />
        </div>
        <div className="story__txt stack-m">
          <Split as="h2" className="h2" id="story-title" text={"Del sur de Brasil\n*al Boulevard.*"} />
          <p className="lede" data-fade>
            Los hermanos fundadores dejaron el campo de Rio Grande del Sur con una obsesión: la calidad. Hoy esa brasa arde en Santa Cruz de la Sierra.
          </p>
          <div data-fade><Button href="/historia" variant="ghost">Leer la historia</Button></div>
        </div>
      </div>
    </section>
  );
}
