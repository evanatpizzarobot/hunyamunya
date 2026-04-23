import Link from "next/link";
import { LABEL_NAME } from "@/lib/jsonld";

const SHOPIFY_URL = "https://hunyamunya.myshopify.com";

const nav = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/artists", label: "Artists" },
  { href: "/discography", label: "Discog" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-rule bg-ink/70 backdrop-blur-[16px] backdrop-saturate-150"
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 md:px-10" style={{ height: 112 }}>
        <Link href="/" aria-label={LABEL_NAME} className="flex items-center">
          <span aria-hidden="true" className="hm-logo-tide block h-20 md:h-24 lg:h-28" />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex gap-[clamp(16px,2.4vw,36px)] text-[12px] uppercase" style={{ letterSpacing: "0.14em" }}>
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group relative block py-1.5 text-paper-dim transition-colors duration-300 hover:text-paper"
                >
                  {item.label}
                  <span className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[color:var(--hm-accent)] transition-transform duration-[450ms] ease-hm group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
            <li>
              <a
                href={SHOPIFY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block py-1.5 text-paper-dim transition-colors duration-300 hover:text-paper"
                aria-label="Shop (opens in new tab)"
              >
                Shop
                <span aria-hidden="true" className="ml-1 text-[10px] text-muted">↗</span>
                <span className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[color:var(--hm-accent)] transition-transform duration-[450ms] ease-hm group-hover:scale-x-100" />
              </a>
            </li>
          </ul>
        </nav>

        <a
          href="https://open.spotify.com/artist/1Lv74nSxjs4UMpxaceSclV"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Listen on Spotify, opens in new tab"
          className="hidden items-center gap-2.5 text-[11px] uppercase text-muted transition-colors duration-300 hover:text-paper lg:flex"
          style={{ letterSpacing: "0.12em" }}
        >
          <span
            className="inline-block h-[7px] w-[7px] rounded-full animate-hm-pulse"
            style={{ background: "oklch(0.78 0.18 145)" }}
          />
          <span>Listen · Rykard</span>
        </a>
      </div>
    </header>
  );
}
