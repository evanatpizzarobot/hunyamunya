import Link from "next/link";
import type { Metadata } from "next";
import { getAllNews } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";

// Kelp zone: smaller faster shadows. Reads as a current carrying small
// debris through — appropriate for a news feed full of dated entries.
const NEWS_LANES: LaneConfig[] = [
  { shape: "narrow", direction: "lr", top: "35%", width: 80, duration: 55, delay: -10, opacityMod: 0.85 },
  { shape: "narrow", direction: "rl", top: "60%", width: 65, duration: 50, delay: -20, opacityMod: 0.75, mobileHide: true },
  { shape: "narrow", direction: "lr", top: "80%", width: 75, duration: 60, delay: -30, opacityMod: 0.9 },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("News"),
    description: "News and updates from Hunya Munya Records: releases, press, and artist milestones.",
    path: "/news",
  });
}

export default function NewsIndex() {
  const news = getAllNews();

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
          ]),
        ]}
      />
      <UnderwaterLayer zone="kelp" lanes={NEWS_LANES}>
      <header className="mb-10">
        <h1 className="font-serif text-4xl text-neutral-50">News</h1>
      </header>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((n) => (
          <li key={n.urlPath}>
            <Link
              href={n.urlPath}
              className="group flex h-full flex-col overflow-hidden border border-neutral-800 transition-colors hover:border-neutral-500"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
                {n.data.hero_image ? (
                  <img
                    src={n.data.hero_image}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <img
                      src="/logo.gif"
                      alt=""
                      aria-hidden="true"
                      className="h-1/2 w-auto opacity-25"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{n.data.date}</p>
                <p className="mt-1 font-serif text-lg leading-snug text-neutral-50 group-hover:text-white">
                  {n.data.title}
                </p>
                {n.data.excerpt ? (
                  <p className="mt-2 line-clamp-3 text-sm text-neutral-300">{n.data.excerpt}</p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      </UnderwaterLayer>
    </>
  );
}
