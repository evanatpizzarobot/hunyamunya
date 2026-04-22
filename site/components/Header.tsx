import Link from "next/link";
import { LABEL_NAME } from "@/lib/jsonld";

const SHOPIFY_URL = "https://hunyamunya.myshopify.com";

const nav = [
  { href: "/", label: "Home" },
  { href: "/artists", label: "Artists" },
  { href: "/catalog", label: "Catalog" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="border-b border-neutral-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
        <Link href="/" aria-label={LABEL_NAME} className="inline-block">
          <img
            src="/logo.gif"
            alt={LABEL_NAME}
            width={900}
            height={600}
            className="h-14 w-auto md:h-16"
            loading="eager"
          />
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-300">
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
                <span aria-hidden="true" className="ml-1 text-xs text-neutral-500">
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
