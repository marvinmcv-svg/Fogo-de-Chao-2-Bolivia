"use client";

import { useEffect, useRef, useState } from "react";
import { ritual } from "@/lib/site";
import { Split } from "../ui/Split";

export function Ritual() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const nao = ritual[active].state === "nao";

  return (
    <section className="section ritual" aria-labelledby="ritual-title">
      <div className="container ritual__grid">
        <div className="ritual__stage">
          <div className={`token${nao ? " is-nao" : ""}`} role="img" aria-label={nao ? "Token en rojo: pausa" : "Token en verde: los cortes continúan"}>
            <div className="token__disc">
              <div className="token__face token__face--sim">
                <small>Sim</small>
                <strong>Por favor</strong>
              </div>
              <div className="token__face token__face--nao">
                <small>Não</small>
                <strong>Obrigado</strong>
              </div>
            </div>
          </div>
          <p className="meta ritual__state" aria-live="polite">{nao ? "Rojo · pausa" : "Verde · servicio continuo"}</p>
        </div>

        <div className="ritual__copy">
          <span className="eyebrow" data-fade>El ritual</span>
          <Split as="h2" className="h2" id="ritual-title" text="Tú marcas *el ritmo.*" />
          <ol className="ritual__steps">
            {ritual.map((s, i) => (
              <li
                key={s.n}
                data-i={i}
                ref={(el) => { stepRefs.current[i] = el; }}
                className={`step${i === active ? " is-active" : ""}`}
              >
                <span className="num step__n">{s.n}</span>
                <div>
                  <h3 className="h3">{s.title}</h3>
                  <p className="body">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
