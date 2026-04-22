import Link from "next/link";
import { LABEL_NAME } from "@/lib/jsonld";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div className="md:max-w-md">
          <Link href="/" aria-label={LABEL_NAME} className="inline-block">
            <img
              src="/logo.gif"
              alt={LABEL_NAME}
              width={900}
              height={600}
              className="h-12 w-auto"
              loading="lazy"
            />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-neutral-400">
            LA based boutique label &amp; publisher since 2002. Crafting Electronic, Ambient &amp; Chillout for Radio/Film/TV. Plus collectible limited Vinyl &amp; CDs worldwide.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-neutral-400">
            <li><Link href="/artists" className="hover:text-neutral-100">Artists</Link></li>
            <li><Link href="/catalog" className="hover:text-neutral-100">Catalog</Link></li>
            <li><Link href="/news" className="hover:text-neutral-100">News</Link></li>
            <li><Link href="/about" className="hover:text-neutral-100">About</Link></li>
            <li><Link href="/press" className="hover:text-neutral-100">Press</Link></li>
            <li><Link href="/contact" className="hover:text-neutral-100">Contact</Link></li>
            <li>
              <a
                href="https://hunyamunya.myshopify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-100"
              >
                Shop
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
