"use client";

import { useId, useState } from "react";

type Item = { q: string; a: string };

/** Single-open accordion: buttons with aria-expanded, panels animated with a grid-rows transition (no height measuring). */
export function Accordion({ items }: { items: readonly Item[] }) {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="acc">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <li key={it.q} className={`acc__item${on ? " is-open" : ""}`}>
            <h2>
              <button type="button" id={`${uid}-b${i}`} aria-expanded={on} aria-controls={`${uid}-p${i}`} onClick={() => setOpen(on ? null : i)}>
                <span>{it.q}</span>
                <i aria-hidden="true" />
              </button>
            </h2>
            <div id={`${uid}-p${i}`} role="region" aria-labelledby={`${uid}-b${i}`} className="acc__panel">
              <div><p className="body">{it.a}</p></div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
