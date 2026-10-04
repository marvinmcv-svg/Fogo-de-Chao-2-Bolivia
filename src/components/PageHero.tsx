import type { CSSProperties } from "react";
import { Split } from "./ui/Split";

export function PageHero({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <header className="phero">
      <div className="container">
        <span className="eyebrow" data-fade data-intro>{eyebrow}</span>
        <Split as="h1" className="h1 phero__title" text={title} delay={0.1} intro />
        {lede && <p className="lede" data-fade data-intro style={{ "--d": "0.5s" } as CSSProperties}>{lede}</p>}
      </div>
    </header>
  );
}
