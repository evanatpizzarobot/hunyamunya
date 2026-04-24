"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NavItem = { href: string; label: string };

type Props = {
  items: NavItem[];
  shopifyUrl: string;
};

/**
 * Mobile-only hamburger menu that reveals a full-viewport navigation overlay
 * with the same links the desktop nav exposes. Hidden above the `md:` (768px)
 * breakpoint. Esc key, body-scroll lock, and Link click all dismiss. Designed
 * to match the site's editorial tone: large uppercase links, monochrome
 * backdrop with soft blur, no decoration competing with content.
 */
export function MobileNav({ items, shopifyUrl }: Props) {
  const [open, setOpen] = useState(false);

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

      <div
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-xl transition-opacity duration-300 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto px-6 pb-14 pt-28">
          <nav aria-label="Mobile primary">
            <ul
              className="flex flex-col items-center gap-7 text-[20px] uppercase"
              style={{ letterSpacing: "0.18em" }}
            >
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="text-paper-dim transition-colors duration-300 hover:text-paper"
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
                  className="text-paper-dim transition-colors duration-300 hover:text-paper"
                >
                  Shop{" "}
                  <span aria-hidden="true" className="text-[14px] text-muted">
                    ↗
                  </span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
