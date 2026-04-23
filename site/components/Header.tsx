import Link from "next/link";
import { LABEL_NAME } from "@/lib/jsonld";

const SHOPIFY_URL = "https://hunyamunya.myshopify.com";

const nav = [
  { href: "/", label: "Home" },
  { href: "/artists", label: "Artists" },
  { href: "/catalog", label: "Catalog" },
  { href: "/discography", label: "Discog" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="relative z-10 border-b border-neutral-900/70 bg-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-4 py-1.5 md:flex-row md:items-center md:justify-between">
        <Link href="/" aria-label={LABEL_NAME} className="inline-block">
          <img
            src="/logo.gif"
            alt={LABEL_NAME}
            width={900}
            height={600}
            className="h-10 w-auto md:h-12 lg:h-14"
            loading="eager"
          />
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm uppercase tracking-[0.12em] text-neutral-300 md:gap-x-5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:text-neutral-50 hover:underline underline-offset-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={SHOPIFY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-50 hover:underline underline-offset-4"
                aria-label="Shop (opens in new tab)"
              >
                Shop
                <span aria-hidden="true" className="ml-1 text-sm text-neutral-500">
                  &#8599;
                </span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
