"use client";

import { useState } from "react";

/** WCAG 2.2.2: auto-playing motion longer than 5s needs a way to pause it. Controls the hero film. */
export function HeroPlayToggle() {
  const [playing, setPlaying] = useState(true);
  const toggle = () => {
    const v = document.querySelector<HTMLVideoElement>(".hero__video");
    if (!v) return;
    if (v.paused) { void v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  return (
    <button type="button" className="hero__pause" onClick={toggle} aria-pressed={!playing} aria-label={playing ? "Pausar video de fondo" : "Reproducir video de fondo"}>
      {playing ? (
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor" /></svg>
      ) : (
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
      )}
    </button>
  );
}
