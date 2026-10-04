"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";

const labels: Record<string, string> = {
  "/": "Inicio", "/menu": "Menú", "/historia": "Historia", "/ubicacion": "Ubicación",
  "/reservas": "Reservas", "/contacto": "Contacto", "/privacidad": "Privacidad", "/terminos": "Términos",
};

/**
 * Curtain page transition. Internal link clicks are intercepted: the curtain rises, the route changes underneath,
 * then it lifts. Scroll-reveals wait for the `curtain:open` event so the new page's entrance is actually seen.
 * Modified clicks, new tabs, hash-only links and reduced-motion users get the browser's normal behaviour.
 */
export function Transition() {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pending = useRef<string | null>(null);
  const failsafe = useRef<number | undefined>(undefined);

  const lift = () => {
    const { gsap } = registerGsap();
    window.clearTimeout(failsafe.current);
    const el = curtain.current;
    if (!el) return;
    gsap.to(el, {
      yPercent: -100, duration: 0.95, ease: "expo.inOut", delay: 0.12,
      onStart: () => {
        window.setTimeout(() => {
          delete document.documentElement.dataset.curtain;
          window.dispatchEvent(new Event("curtain:open"));
        }, 350);
      },
      onComplete: () => { gsap.set(el, { visibility: "hidden" }); pending.current = null; },
    });
  };

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const { gsap } = registerGsap();

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target || a.hasAttribute("download") || pending.current) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;

      e.preventDefault();
      e.stopPropagation();
      pending.current = url.pathname;
      document.documentElement.dataset.curtain = "1";
      if (label.current) label.current.textContent = labels[url.pathname] ?? "";
      const el = curtain.current!;
      gsap.set(el, { visibility: "visible", y: 0, yPercent: 100 });
      gsap.to(el, {
        yPercent: 0, duration: 0.8, ease: "expo.inOut",
        onComplete: () => {
          router.push(url.pathname + url.search + url.hash);
          failsafe.current = window.setTimeout(lift, 4000); // never leave the user behind a curtain
        },
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // Route committed → lift the curtain.
  useEffect(() => {
    if (pending.current && pending.current === pathname) {
      const id = requestAnimationFrame(() => requestAnimationFrame(lift));
      return () => cancelAnimationFrame(id);
    }
  }, [pathname]);

  return (
    <div ref={curtain} className="curtain" aria-hidden="true">
      <span ref={label} className="curtain__label" />
    </div>
  );
}
