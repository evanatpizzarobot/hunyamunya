import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import { getAllNews, getNewsBySlug } from "@/lib/content";
import { buildMetadata, newsTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd, newsJsonLd } from "@/lib/jsonld";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";

// Surface zone, single drift. Detail-page calm.
const NEWS_DETAIL_LANES: LaneConfig[] = [
  { shape: "narrow", direction: "lr", top: "60%", width: 80, duration: 65, delay: -15, opacityMod: 0.85 },
];

type Params = { year: string; slug: string };

export function generateStaticParams(): Params[] {
  return getAllNews().map((n) => ({ year: String(n.year), slug: n.data.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { year, slug } = await params;
  const n = getNewsBySlug(parseInt(year, 10), slug);
  if (!n) return {};
  const title = n.data.seoTitle ?? newsTitle(n.data.title);
  const description = n.data.metaDescription ?? n.data.seo?.description ?? n.data.excerpt;
  return buildMetadata({
    title,
    description,
    path: n.urlPath,
    ogImage: n.data.ogImage ?? n.data.hero_image,
    ogType: "article",
  });
}

export default async function NewsPost({ params }: { params: Promise<Params> }) {
  const { year, slug } = await params;
  const n = getNewsBySlug(parseInt(year, 10), slug);
  if (!n) notFound();

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: n.data.title, path: n.urlPath },
          ]),
          newsJsonLd(n.data, n.urlPath),
        ]}
      />
      <UnderwaterLayer zone="surface" lanes={NEWS_DETAIL_LANES}>
      <article>
        <header className="mb-6">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">{n.data.date}</p>
          <h1 className="mt-1 font-serif text-4xl text-neutral-50">{n.data.title}</h1>
        </header>
        <div className="prose prose-invert prose-neutral max-w-3xl">
          <MDXRemote source={n.body} components={mdxComponents} />
        </div>
      </article>
      </UnderwaterLayer>
    </>
  );
}
