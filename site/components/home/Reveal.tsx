"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3 | 4;
  as?: "div" | "section" | "article" | "header" | "li" | "p" | "h1" | "h2";
  className?: string;
};

export function Reveal({ children, delay = 0, as: Tag = "div", className = "" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const t = setTimeout(() => el.classList.add("is-in"), 40);
      return () => clearTimeout(t);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delayClass = delay ? `d${delay}` : "";
  const Element = Tag as keyof JSX.IntrinsicElements;
  return (
    // @ts-expect-error - dynamic tag with a ref that unions over elements
    <Element ref={ref} className={`hm-reveal ${delayClass} ${className}`.trim()}>
      {children}
    </Element>
  );
}
