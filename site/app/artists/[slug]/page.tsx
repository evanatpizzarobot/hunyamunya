import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import {
  getAllArtists,
  getArtistBySlug,
  getReleasesByArtistSlug,
} from "@/lib/content";
import { buildMetadata, artistTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { artistJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

type Params = { slug: string };

function youtubeEmbedFrom(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

// Converts `*asterisk-wrapped*` runs in a plaintext shortBio into italic
// <em> elements so release titles and press names read as properly emphasized
// inside the Highlights pill. Everything else passes through as text.
function renderEmphasis(text: string): React.ReactNode[] {
  return text.split(/(\*[^*]+\*)/g).map((part, i) => {
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

// First 4-digit year inside a `yearsActive` string like "2005", "2005-2008",
// or "1989-present". Used to populate the "Est. YEAR" kicker when the artist
// hasn't set an explicit `intro.est_year`.
function parseFirstYear(yearsActive: string | undefined): number | undefined {
  if (!yearsActive) return undefined;
  const m = yearsActive.match(/\d{4}/);
  return m ? parseInt(m[0], 10) : undefined;
}

// When an artist has no curated `shortBio` in frontmatter, extract a serviceable
// highlight from the first paragraph of the MDX body. Strips WP-imported HTML
// tags, markdown links, and common entities, then trims to one or two sentences.
// Returns null if the body is a stub with no usable prose.
function deriveFallbackHighlight(body: string): string | null {
  const firstPara = body.trim().split(/\n\s*\n/)[0] ?? "";
  if (!firstPara) return null;
  const clean = firstPara
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Skip if this looks like the stub banner ("Full bio pending...") rather than real bio prose.
  if (/^>?\s*Full bio pending/i.test(clean) || /enrichment pass will populate/i.test(clean)) {
    return null;
  }
  if (clean.length < 20) return null;
  const match = clean.match(/^(.{40,260}?[.!?])(\s|$)/);
  return match ? match[1] : clean.slice(0, 260);
}

export function generateStaticParams(): Params[] {
  return getAllArtists().map((a) => ({ slug: a.data.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getArtistBySlug(slug);
  if (!doc) return {};
  const title = doc.data.seoTitle ?? artistTitle(doc.data.name);
  const description =
    doc.data.metaDescription ??
    doc.data.seo?.description ??
    doc.data.shortBio;
  return buildMetadata({
    title,
    description,
    path: `/artists/${slug}`,
    ogImage: doc.data.ogImage ?? doc.data.hero_image ?? doc.data.portrait,
  });
}

export default async function ArtistPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getArtistBySlug(slug);
  if (!doc) notFound();
  const releases = getReleasesByArtistSlug(slug).sort((a, b) => b.year - a.year);

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Artists", path: "/artists" },
            { name: doc.data.name, path: `/artists/${slug}` },
          ]),
          artistJsonLd(
            doc.data,
            releases.map((r) => r.data),
          ),
        ]}
      />
      <article>
        <header className="mb-10">
          <h1 className="font-serif text-5xl text-neutral-50">{doc.data.name}</h1>

          {doc.data.portrait ? (
            <figure className="mt-5 max-w-sm overflow-hidden border border-neutral-800">
              <img
                src={doc.data.portrait}
                alt={doc.data.name}
                className="block h-auto w-full"
                loading="eager"
              />
            </figure>
          ) : null}

          {(() => {
            const intro = doc.data.intro;
            const h1 = intro?.heading_line_1;
            const h2 = intro?.heading_line_2;
            const showHeading = Boolean(h1 || h2);

            const blurbHtml = intro?.blurb_html;
            const blurbText = !blurbHtml
              ? doc.data.shortBio ?? deriveFallbackHighlight(doc.body)
              : null;

            const estYear = intro?.est_year ?? parseFirstYear(doc.data.yearsActive);

            const highlights = intro?.highlights ?? [];
            const tags =
              intro?.tags && intro.tags.length > 0
                ? intro.tags
                : (doc.data.genres ?? []).map((name) => ({
                    name,
                    accent: false,
                  }));

            if (
              !showHeading &&
              !blurbHtml &&
              !blurbText &&
              highlights.length === 0 &&
              tags.length === 0
            ) {
              return null;
            }

            return (
              <section
                className="artist-intro"
                aria-label={`${doc.data.name} profile`}
              >
                <div className="ai-accent" />
                <div className="ai-top">
                  <span className="ai-kicker">§ Profile · HMR</span>
                  {estYear ? (
                    <>
                      <span className="ai-dot" aria-hidden="true" />
                      <span className="ai-kicker">Est. {estYear}</span>
                    </>
                  ) : null}
                </div>
                {showHeading ? (
                  <h2 className="ai-heading">
                    {h1 ? <span className="ai-heading-line">{h1}</span> : null}
                    {h2 ? (
                      <span className="ai-heading-line ai-heading-italic">
                        {h2}
                      </span>
                    ) : null}
                  </h2>
                ) : null}
                {blurbHtml ? (
                  <p
                    className="ai-blurb"
                    dangerouslySetInnerHTML={{ __html: blurbHtml }}
                  />
                ) : blurbText ? (
                  <p className="ai-blurb">{renderEmphasis(blurbText)}</p>
                ) : null}
                {highlights.length > 0 ? (
                  <div className="ai-highlights">
                    {highlights.map((h, i) => (
                      <div key={`${h.label}-${i}`} className="ai-stat">
                        <span className="ai-stat-num">{h.num}</span>
                        <span className="ai-stat-label">{h.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {tags.length > 0 ? (
                  <div className="ai-tags">
                    {tags.map((t, i) => (
                      <span
                        key={`${t.name}-${i}`}
                        className={`ai-tag${t.accent ? " ai-tag-accent" : ""}`}
                      >
                        {t.accent ? "★ " : ""}
                        {t.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })()}
        </header>

        <div className="prose prose-invert prose-neutral max-w-3xl">
          <MDXRemote source={doc.body} components={mdxComponents} />
        </div>

        {doc.data.featured_video && youtubeEmbedFrom(doc.data.featured_video) ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Listen</h2>
            <div className="mt-4 aspect-video w-full max-w-3xl overflow-hidden border border-neutral-800 bg-black">
              <iframe
                src={youtubeEmbedFrom(doc.data.featured_video)!}
                title={`${doc.data.name}, featured track`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </section>
        ) : null}

        {releases.length > 0 ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Discography</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {releases.map((r) => (
                <li key={r.catnoSlug}>
                  <Link
                    href={r.urlPath}
                    className="block border border-neutral-800 p-3 text-sm hover:border-neutral-600 hover:bg-neutral-900"
                  >
                    <span className="block font-serif text-neutral-50">{r.data.title}</span>
                    <span className="block text-xs text-neutral-500">
                      {r.data.catalog_number ? `${r.data.catalog_number} · ` : ""}
                      {r.year} · {r.data.format.join(", ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {doc.data.links && Object.keys(doc.data.links).length > 0 ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Elsewhere</h2>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-300">
              {Object.entries(doc.data.links).map(([k, v]) => {
                if (!v) return null;
                let label = k;
                try {
                  label = new URL(v).hostname.replace(/^www\./, "");
                } catch {}
                return (
                  <li key={k}>
                    <a
                      href={v}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 hover:text-neutral-50 hover:underline"
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </article>
    </>
  );
}
