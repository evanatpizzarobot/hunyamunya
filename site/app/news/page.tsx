import Link from "next/link";
import type { Metadata } from "next";
import { getAllNews } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";

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
      <header className="mb-10">
        <h1 className="font-serif text-4xl text-neutral-50">News</h1>
      </header>
      <ul className="space-y-4">
        {news.map((n) => (
          <li key={n.urlPath}>
            <Link
              href={n.urlPath}
              className="block border border-neutral-800 p-4 transition-colors hover:border-neutral-600 hover:bg-neutral-900"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">{n.data.date}</p>
              <p className="mt-1 font-serif text-xl text-neutral-50">{n.data.title}</p>
              {n.data.excerpt ? (
                <p className="mt-2 text-sm text-neutral-300">{n.data.excerpt}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
