import { createElement, type ReactNode } from "react";

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  className?: string;
  /** Plain text; wrap emphasised words in *asterisks*. Use "\n" for forced line breaks. */
  text: string;
  delay?: number;
  id?: string;
};

/**
 * Word-level masked headline. Server-rendered (readable without JS); animated by <Motion />.
 * The full text is exposed once to assistive tech via aria-label, the split spans are aria-hidden.
 */
export function Split({ as = "h2", className, text, delay = 0, id }: Props) {
  const plain = text.replace(/\*/g, "").replace(/\n/g, " ");
  const lines = text.split("\n");
  const children: ReactNode[] = [];
  lines.forEach((line, li) => {
    const parts = line.split(/(\*[^*]+\*)/g).filter(Boolean);
    parts.forEach((part, pi) => {
      const em = part.startsWith("*") && part.endsWith("*");
      const words = (em ? part.slice(1, -1) : part).split(" ").filter(Boolean);
      words.forEach((word, wi) => {
        const inner = <span>{word}</span>;
        children.push(
          <span className="w" key={`${li}-${pi}-${wi}`}>
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
    { className, id, "data-split": "", "data-delay": delay || undefined, "aria-label": plain },
    <span aria-hidden="true">{children}</span>,
  );
}
