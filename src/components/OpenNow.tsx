"use client";

import { useSyncExternalStore } from "react";
import { openStatus } from "@/lib/hours";

// Minute-granular clock; server snapshot is null so nothing mismatches during hydration.
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
};
const snapshot = () => Math.floor(Date.now() / 60_000);

export function OpenNow({ className = "" }: { className?: string }) {
  const minute = useSyncExternalStore(subscribe, snapshot, () => null);
  if (minute === null) return <span className={`open-now ${className}`} aria-hidden="true" />;
  const s = openStatus(new Date(minute * 60_000));
  return (
    <span className={`open-now ${className}`} role="status">
      <i className={s.open ? "on" : ""} aria-hidden="true" />
      {s.text}
    </span>
  );
}
