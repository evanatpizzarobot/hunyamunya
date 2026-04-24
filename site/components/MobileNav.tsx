"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type NavItem = { href: string; label: string };

type Props = {
  items: NavItem[];
  shopifyUrl: string;
};

/**
 * Mobile-only hamburger menu that reveals a full-viewport navigation overlay
 * with the same links the desktop nav exposes. Hidden above the `md:` (768px)
 * breakpoint. Esc key, body-scroll lock, and Link click all dismiss.
 *
 * The overlay is portaled to document.body because the <header> uses
 * backdrop-filter (backdrop-blur), which per CSS spec makes the header a
 * containing block for fixed-positioned descendants. Without the portal,
 * `fixed inset-0` inside the header gets clipped to the header's own 112px
 * height and only the first list item is visible.
 */
export function MobileNav({ items, shopifyUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const close = () => setOpen(false);

  const overlay = (
    <div
      id="mobile-nav-panel"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={`fixed inset-0 z-[100] flex flex-col bg-ink/95 backdrop-blur-xl transition-opacity duration-300 md:hidden ${
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      style={{ height: "100dvh" }}
    >
      <div className="flex items-center justify-end px-5 pt-5">
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className="relative flex h-10 w-10 items-center justify-center"
        >
          <span className="absolute block h-[2px] w-6 rotate-45 bg-paper" />
          <span className="absolute block h-[2px] w-6 -rotate-45 bg-paper" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-10">
        <nav aria-label="Mobile primary">
          <ul
            className="flex flex-col items-center gap-6 text-[18px] uppercase"
            style={{ letterSpacing: "0.18em" }}
          >
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block py-1 text-paper-dim transition-colors duration-300 hover:text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={shopifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="block py-1 text-paper-dim transition-colors duration-300 hover:text-paper"
              >
                Shop{" "}
                <span aria-hidden="true" className="text-[14px] text-muted">
                  &#x2197;
                </span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="relative z-[60] flex h-10 w-10 flex-col items-center justify-center gap-[6px] md:hidden"
      >
        <span
          className={`block h-[2px] w-6 bg-paper transition-transform duration-300 ease-hm ${
            open ? "translate-y-[8px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-6 bg-paper transition-opacity duration-200 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-6 bg-paper transition-transform duration-300 ease-hm ${
            open ? "-translate-y-[8px] -rotate-45" : ""
          }`}
        />
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
