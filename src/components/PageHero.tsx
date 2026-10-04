import { Split } from "./ui/Split";

export function PageHero({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <header className="phero">
      <div className="container">
        <span className="eyebrow" data-fade>{eyebrow}</span>
        <Split as="h1" className="h1 phero__title" text={title} delay={0.1} />
        {lede && <p className="lede" data-fade data-delay="0.5">{lede}</p>}
      </div>
    </header>
  );
}
