"use client";

import { useEffect } from "react";

export function HeroParallax() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (media?.matches) return;

    const handler = (e: MouseEvent) => {
      const hero = document.getElementById("hm-hero");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0) return;
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      const intensity = 6;
      const photo = hero.querySelector<HTMLElement>("[data-hm-hero-photo]");
      if (photo) {
        photo.style.transform = `scale(1.06) translate(${-cx * intensity}px, ${-cy * intensity * 0.4}px)`;
      }
    };

    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  return null;
}
