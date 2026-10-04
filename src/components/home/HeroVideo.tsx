"use client";

import { useRef } from "react";

/** Fades the film in only once it is actually playing; the poster image underneath covers autoplay failures and slow networks. */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <video
      ref={ref}
      className="hero__video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onPlaying={() => ref.current?.classList.add("is-playing")}
    >
      <source src="/media/video/hero.mp4" type="video/mp4" />
    </video>
  );
}
