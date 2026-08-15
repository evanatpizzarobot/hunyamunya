// SEO spec §2.2: title/description formulas + Metadata API helper.

import type { Metadata } from "next";
import { LABEL_NAME, SITE_URL } from "./jsonld";

const OG_DEFAULT = "/og-default.png";

type BuildArgs = {
  /** Bare title, with no label suffix. The root layout appends the label. */
  title?: string;
  /**
   * Set only by the home page, whose title leads with the label rather than
   * appending it. Skips both the strip and the layout template.
   */
  titleIsAbsolute?: boolean;
  description?: string;
  path?: string;
  /**
   * Suppresses the canonical tag. Only the 404 needs this: with no path, the
   * canonical would otherwise resolve to the site root and tell crawlers that
   * every junk URL is the home page.
   */
  noCanonical?: boolean;
  ogImage?: string;
  ogType?: "website" | "article" | "music.album";
  index?: boolean;
  follow?: boolean;
};

// The root layout owns the label suffix through metadata.title.template, so
// every title arriving here has to be bare or it renders twice, as in
// "Flicker · Boom Jinx · HMR006 · Hunya Munya Records · Hunya Munya Records".
// Frontmatter written before that rule spells the suffix out inline in two
// shapes, "Name · Label" and "Name, Label", so strip both and keep stripping
// until the title stops changing. Cheap insurance against the habit coming
// back the next time someone hand-writes an seoTitle.
function stripLabelSuffix(title: string): string {
  let out = title.trim();
  for (;;) {
    const next = [" · ", ", "].reduce((s, sep) => {
      const suffix = `${sep}${LABEL_NAME}`;
      return s.endsWith(suffix) ? s.slice(0, -suffix.length).trim() : s;
    }, out);
    if (next === out) return out;
    out = next;
  }
}

function absolute(pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return `${SITE_URL}${OG_DEFAULT}`;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl}`;
}

export function buildMetadata(opts: BuildArgs): Metadata {
  const isAbsolute = opts.titleIsAbsolute === true;
  const bare = opts.title ? (isAbsolute ? opts.title.trim() : stripLabelSuffix(opts.title)) : "";
  // Next applies the layout's title template to the <title> tag only, never to
  // openGraph.title or twitter.title, so the social titles carry the label
  // themselves. Without this a share card would read just "Cinematrik".
  const socialTitle = !bare ? LABEL_NAME : isAbsolute ? bare : `${bare} · ${LABEL_NAME}`;
  // Omitting `title` entirely lets the layout's default apply, which is the
  // right answer for any page that never named one.
  const titleField: Pick<Metadata, "title"> = !bare
    ? {}
    : { title: isAbsolute ? { absolute: bare } : bare };
  const url = opts.path ? `${SITE_URL}${opts.path}` : SITE_URL;
  const ogImage = absolute(opts.ogImage);
  return {
    ...titleField,
    description: opts.description,
    metadataBase: new URL(SITE_URL),
    ...(opts.noCanonical ? {} : { alternates: { canonical: url } }),
    robots: {
      index: opts.index ?? true,
      follow: opts.follow ?? true,
    },
    openGraph: {
      type: opts.ogType ?? "website",
      url,
      title: socialTitle,
      description: opts.description,
      siteName: LABEL_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: opts.description,
      images: [ogImage],
    },
  };
}

// Title formulas per SEO spec §2.2. Separator is the middle-dot U+00B7 per
// global writing rule (no em-dashes anywhere). Middle-dot is a common SEO
// title separator alongside | and :.
// Every formula below returns a BARE title. buildMetadata hands it to Next,
// and the root layout's `%s · Hunya Munya Records` template appends the label
// exactly once. The home page is the one exception: its title leads with the
// label, so it is passed through as absolute.
export function homeTitle(): string {
  return `${LABEL_NAME} · LA Boutique Label, Electronic Ambient Chillout since 2002`;
}
export function artistTitle(name: string): string {
  return name;
}
export function releaseTitle(title: string, artistName: string, catno?: string): string {
  return catno ? `${title} · ${artistName} · ${catno}` : `${title} · ${artistName}`;
}
export function newsTitle(postTitle: string): string {
  return postTitle;
}
export function sectionTitle(sectionTitle: string): string {
  return sectionTitle;
}
