// SEO spec §2.2: title/description formulas + Metadata API helper.

import type { Metadata } from "next";
import { LABEL_NAME, SITE_URL } from "./jsonld";

const OG_DEFAULT = "/og-default.png";

type BuildArgs = {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "music.album";
  index?: boolean;
  follow?: boolean;
};

function absolute(pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return `${SITE_URL}${OG_DEFAULT}`;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl}`;
}

export function buildMetadata(opts: BuildArgs): Metadata {
  const title = opts.title ?? LABEL_NAME;
  const url = opts.path ? `${SITE_URL}${opts.path}` : SITE_URL;
  const ogImage = absolute(opts.ogImage);
  return {
    title,
    description: opts.description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: {
      index: opts.index ?? true,
      follow: opts.follow ?? true,
    },
    openGraph: {
      type: opts.ogType ?? "website",
      url,
      title,
      description: opts.description,
      siteName: LABEL_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: opts.description,
      images: [ogImage],
    },
  };
}

// Title formulas per SEO spec §2.2. Separator is the middle-dot U+00B7 per
// global writing rule (no em-dashes anywhere). Middle-dot is a common SEO
// title separator alongside | and :.
export function homeTitle(): string {
  return `${LABEL_NAME} · LA Boutique Label, Electronic Ambient Chillout since 2002`;
}
export function artistTitle(name: string): string {
  return `${name} · ${LABEL_NAME}`;
}
export function releaseTitle(title: string, artistName: string, catno?: string): string {
  return catno
    ? `${title} · ${artistName} · ${catno} · ${LABEL_NAME}`
    : `${title} · ${artistName} · ${LABEL_NAME}`;
}
export function newsTitle(postTitle: string): string {
  return `${postTitle} · ${LABEL_NAME}`;
}
export function sectionTitle(sectionTitle: string): string {
  return `${sectionTitle} · ${LABEL_NAME}`;
}
