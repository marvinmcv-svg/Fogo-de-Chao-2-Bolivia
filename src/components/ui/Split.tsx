import { createElement, type CSSProperties, type ReactNode } from "react";

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  className?: string;
  /** Plain text; wrap emphasised words in *asterisks*. Use "\n" for forced line breaks. */
  text: string;
  delay?: number;
  id?: string;
  /** Above-the-fold: animate with CSS at first paint instead of waiting for JS (keeps LCP independent of script load). */
  intro?: boolean;
};

/**
 * Word-level masked headline. Server-rendered (readable without JS); animated by <Motion />.
 * The full text is exposed once to assistive tech via aria-label, the split spans are aria-hidden.
 */
export function Split({ as = "h2", className, text, delay = 0, id, intro = false }: Props) {
  const plain = text.replace(/\*/g, "").replace(/\n/g, " ");
  const lines = text.split("\n");
  const children: ReactNode[] = [];
  let n = 0;
  lines.forEach((line, li) => {
    const parts = line.split(/(\*[^*]+\*)/g).filter(Boolean);
    parts.forEach((part, pi) => {
      const em = part.startsWith("*") && part.endsWith("*");
      const words = (em ? part.slice(1, -1) : part).split(" ").filter(Boolean);
      words.forEach((word, wi) => {
        const inner = <span>{word}</span>;
        children.push(
          <span className="w" key={`${li}-${pi}-${wi}`} style={{ "--i": n++ } as CSSProperties}>
            {em ? <em>{inner}</em> : inner}
          </span>,
        );
        children.push(" ");
      });
    });
    if (li < lines.length - 1) children.push(<br key={`br-${li}`} />);
  });

  return createElement(
    as,
    { className, id, "data-split": "", "data-delay": delay || undefined, "data-intro": intro ? "" : undefined, style: intro ? ({ "--d": `${delay}s` } as CSSProperties) : undefined, "aria-label": plain },
    <span aria-hidden="true">{children}</span>,
  );
}
