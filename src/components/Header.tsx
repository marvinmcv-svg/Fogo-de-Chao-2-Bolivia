"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { nav, site, telLink, whatsappLink } from "@/lib/site";
import { smooth } from "@/lib/motion";

export function Header() {
  const pathname = usePathname();
  // Menu is open only for the route it was opened on, so navigation closes it without an effect.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hide on scroll down, reveal on scroll up; solid background after the fold.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      if (!open) setHidden(y > last && y > 240);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  const close = useCallback(() => setOpenAt(null), []);

  // Scroll lock, Escape, focus management while the menu is open.
  useEffect(() => {
    if (!open) return;
    smooth.lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const first = menuRef.current?.querySelector<HTMLElement>("a");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); burgerRef.current?.focus(); }
      if (e.key === "Tab") {
        const focusables = [burgerRef.current, ...(menuRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? [])].filter(Boolean) as HTMLElement[];
        const i = focusables.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); focusables.at(-1)?.focus(); }
        else if (!e.shiftKey && i === focusables.length - 1) { e.preventDefault(); focusables[0]?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      smooth.lenis?.start();
    };
  }, [open, close]);

  return (
    <>
      <header className={`header${solid ? " is-solid" : ""}${hidden ? " is-hidden" : ""}`}>
        <div className="container header__inner">
          <Link href="/" className="header__logo" aria-label={`${site.name}, inicio`}>
            <Image src="/media/brand/fogo-logo-white.png" alt="" width={960} height={194} priority sizes="184px" />
          </Link>

          <nav className="header__nav" aria-label="Principal">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} data-scramble aria-current={pathname === item.href ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <Button href="/reservas" arrow={false}>Reservar</Button>
            <button
              ref={burgerRef}
              type="button"
              className="burger"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpenAt(open ? null : pathname)}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div id="site-menu" ref={menuRef} className={`menu${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Menú" aria-hidden={!open} inert={!open}>
        <nav aria-label="Menú móvil" className="menu__links">
          {[{ href: "/", label: "Inicio" }, ...nav].map((item) => (
            <Link key={item.href} href={item.href} onClick={close}>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="menu__foot">
          <p>{site.address.line1}<br />{site.address.line2}</p>
          <p>
            <a href={telLink(site.phones.landline.e164)}>{site.phones.landline.display}</a>{" "}
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp {site.phones.whatsapp.display}</a>
          </p>
        </div>
      </div>
    </>
  );
}
