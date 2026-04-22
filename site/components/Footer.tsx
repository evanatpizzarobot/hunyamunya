import Link from "next/link";
import { LABEL_NAME } from "@/lib/jsonld";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:justify-between">
        <div>
          <p className="font-serif text-lg text-neutral-100">{LABEL_NAME}</p>
          <p className="text-sm text-neutral-400">An independent record label since 2003.</p>
          <p className="text-sm text-neutral-400">Los Angeles, CA, USA</p>
          <p className="mt-2 text-sm">
            <Link href="/contact" className="text-neutral-300 underline-offset-4 hover:underline">
              evan@hunyamunyarecords.com
            </Link>
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-neutral-400">
            <li><Link href="/artists" className="hover:text-neutral-100">Artists</Link></li>
            <li><Link href="/catalog" className="hover:text-neutral-100">Catalog</Link></li>
            <li><Link href="/news" className="hover:text-neutral-100">News</Link></li>
            <li><Link href="/about" className="hover:text-neutral-100">About</Link></li>
            <li><Link href="/press" className="hover:text-neutral-100">Press</Link></li>
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
