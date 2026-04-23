import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-rule pt-24 pb-10">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-20 grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-5">
              <img
                src="/logo.gif"
                alt="Hunya Munya Records"
                width={900}
                height={600}
                className="h-14 w-auto"
                loading="lazy"
              />
            </div>
            <p className="max-w-[36ch] text-[15px] italic leading-relaxed text-paper-dim">
              LA based boutique label &amp; publisher since 2002. Crafting Electronic, Ambient &amp; Chillout
              for Radio, Film, and TV. Plus collectible limited Vinyl &amp; CDs worldwide.
            </p>
          </div>
          <div>
            <h5 className="mb-4 text-[10px] font-normal uppercase text-muted" style={{ letterSpacing: "0.22em" }}>
              Explore
            </h5>
            <ul className="flex flex-col gap-2.5 text-[12px] uppercase text-paper-dim" style={{ letterSpacing: "0.04em" }}>
              <li><Link href="/catalog" className="transition-colors duration-300 hover:text-[color:var(--hm-accent)]">Catalog</Link></li>
              <li><Link href="/artists" className="transition-colors duration-300 hover:text-[color:var(--hm-accent)]">Artists</Link></li>
              <li><Link href="/discography" className="transition-colors duration-300 hover:text-[color:var(--hm-accent)]">Discography</Link></li>
              <li><Link href="/news" className="transition-colors duration-300 hover:text-[color:var(--hm-accent)]">News</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4 text-[10px] font-normal uppercase text-muted" style={{ letterSpacing: "0.22em" }}>
              Label
            </h5>
            <ul className="flex flex-col gap-2.5 text-[12px] uppercase text-paper-dim" style={{ letterSpacing: "0.04em" }}>
              <li><Link href="/about" className="transition-colors duration-300 hover:text-[color:var(--hm-accent)]">About</Link></li>
              <li><Link href="/press" className="transition-colors duration-300 hover:text-[color:var(--hm-accent)]">Press</Link></li>
              <li><Link href="/contact" className="transition-colors duration-300 hover:text-[color:var(--hm-accent)]">Contact</Link></li>
              <li>
                <a
                  href="https://hunyamunya.myshopify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-300 hover:text-[color:var(--hm-accent)]"
                >
                  Shop ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4 text-[10px] font-normal uppercase text-muted" style={{ letterSpacing: "0.22em" }}>
              Elsewhere
            </h5>
            <ul className="flex flex-col gap-2.5 text-[12px] uppercase text-paper-dim" style={{ letterSpacing: "0.04em" }}>
              <li>
                <a href="https://rykard.bandcamp.com" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:text-[color:var(--hm-accent)]">
                  Bandcamp ↗
                </a>
              </li>
              <li>
                <a href="https://open.spotify.com/artist/1Lv74nSxjs4UMpxaceSclV" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:text-[color:var(--hm-accent)]">
                  Spotify ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex items-end justify-between gap-6 text-[10px] uppercase text-muted" style={{ letterSpacing: "0.2em" }}>
          <span>© 2002—{new Date().getFullYear()} · Hunya Munya Records</span>
          <span>Los Angeles, CA · All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
