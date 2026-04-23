import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-neutral-900/70 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div className="md:max-w-md">
          <p className="text-sm leading-relaxed text-neutral-400">
            LA based boutique label &amp; publisher since 2002. Crafting Electronic, Ambient &amp; Chillout for Radio/Film/TV. Plus collectible limited Vinyl &amp; CDs worldwide.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-400 md:justify-end">
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
