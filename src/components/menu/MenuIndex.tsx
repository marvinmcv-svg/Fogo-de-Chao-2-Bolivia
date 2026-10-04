"use client";

import Image from "next/image";
import { useState } from "react";
import { menuSections } from "@/lib/site";

/** Typographic index. On desktop a sticky preview crossfades to the section being hovered/focused; on mobile each row carries its own image. */
export function MenuIndex() {
  const [active, setActive] = useState(0);
  return (
    <div className="container menuidx">
      <ol className="menuidx__list">
        {menuSections.map((m, i) => (
          <li
            key={m.id}
            id={m.id}
            className={`menuidx__row${i === active ? " is-active" : ""}`}
            onMouseEnter={() => setActive(i)}
            onFocusCapture={() => setActive(i)}
          >
            <span className="num meta">0{i + 1}</span>
            <div className="menuidx__main">
              <h2 className="display menuidx__name" tabIndex={0}>{m.name}</h2>
              <p className="body">{m.blurb}</p>
              <div className="menuidx__thumb mask">
                <Image src={m.image} alt="" fill sizes="(min-width: 62rem) 0px, 90vw" loading="lazy" />
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="menuidx__preview" aria-hidden="true">
        {menuSections.map((m, i) => (
          <div key={m.id} className={`menuidx__img${i === active ? " is-active" : ""}`}>
            <Image src={m.image} alt="" fill sizes="40vw" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
