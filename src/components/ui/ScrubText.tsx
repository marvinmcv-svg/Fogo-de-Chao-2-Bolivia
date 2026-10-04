import { createElement } from "react";

/** Paragraph whose words brighten as it scrolls through the viewport (see Motion → [data-scrub]). */
export function ScrubText({ text, className, as = "p" }: { text: string; className?: string; as?: "p" | "h2" | "div" }) {
  const plain = text.replace(/\*/g, "");
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  const nodes = parts.flatMap((part, pi) => {
    const em = part.startsWith("*");
    return (em ? part.slice(1, -1) : part).split(" ").filter(Boolean).map((word, wi) => {
      const el = <span className="sw">{word}</span>;
      return <span key={`${pi}-${wi}`}>{em ? <em>{el}</em> : el}{" "}</span>;
    });
  });
  return createElement(as, { className, "data-scrub": "", "aria-label": plain }, <span aria-hidden="true">{nodes}</span>);
}
