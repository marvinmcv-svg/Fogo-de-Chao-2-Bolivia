import { ScrubText } from "../ui/ScrubText";

export function Manifesto() {
  return (
    <section className="section manifesto" aria-label="Filosofía" data-tone="ember">
      <div className="container grid">
        <ScrubText
          as="h2"
          className="manifesto__text h2"
          text="El churrasco es una conversación lenta entre *fuego, sal y paciencia.* Nosotros solo la servimos a tu mesa."
        />
      </div>
    </section>
  );
}
