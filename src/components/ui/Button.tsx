import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Arrow } from "./Icons";

type Variant = "primary" | "ghost";

type Props = {
  variant?: Variant;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "className" | "children">;

/** Internal links use next/link; external (http, tel, wa.me) render a plain anchor. */
export function Button({ variant = "primary", arrow = true, children, className = "", href, ...rest }: Props) {
  const cls = `btn btn-${variant} ${className}`.trim();
  const external = typeof href === "string" && /^(https?:|tel:|mailto:)/.test(href);
  const content = (
    <>
      <span>{children}</span>
      {arrow && <Arrow />}
    </>
  );
  if (external) {
    const { prefetch: _p, replace: _r, scroll: _s, shallow: _sh, ...anchor } = rest as Record<string, unknown>;
    void _p; void _r; void _s; void _sh;
    return (
      <a className={cls} data-magnetic href={href as string} target={href.toString().startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" {...(anchor as object)}>
        {content}
      </a>
    );
  }
  return (
    <Link className={cls} data-magnetic href={href} {...rest}>
      {content}
    </Link>
  );
}
