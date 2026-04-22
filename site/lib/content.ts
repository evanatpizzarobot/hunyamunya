// MDX loaders for content/{artists,releases,news,pages,campaigns}.
// Each loader reads, validates via Zod, and returns typed objects with the
// raw MDX body string. Routes render the body via next-mdx-remote/rsc.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import type { z } from "zod";

import {
  Artist,
  artistSchema,
  Campaign,
  campaignSchema,
  News,
  newsSchema,
  Release,
  releaseSchema,
} from "./schema";

export type NormalizedArtistRef = {
  slug: string;
  name?: string;
  role: "primary" | "featured" | "remixer" | "producer";
};

const CONTENT_ROOT = resolve(process.cwd(), "content");
const ARTISTS_DIR = join(CONTENT_ROOT, "artists");
const RELEASES_DIR = join(CONTENT_ROOT, "releases");
const NEWS_DIR = join(CONTENT_ROOT, "news");
const CAMPAIGNS_DIR = join(CONTENT_ROOT, "campaigns");

export type Loaded<T> = { data: T; body: string; sourcePath: string };

export type ArtistDoc = Loaded<Artist>;
export type ReleaseDoc = Loaded<Release> & {
  year: number;
  catnoSlug: string;
  urlPath: string;
  // All artists on the release, primary first, then additional. Derived from
  // either the `artists` array (preferred) or from `artist` + `artists_additional`.
  resolvedArtists: NormalizedArtistRef[];
};
export type NewsDoc = Loaded<News> & {
  year: number;
  urlPath: string;
};

function listMdxFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".mdx") && !name.startsWith("."))
    .sort();
}

function loadMdx<S extends z.ZodType>(path: string, schema: S): Loaded<z.output<S>> {
  const raw = readFileSync(path, "utf8");
  const parsed = matter(raw);
  const result = schema.safeParse(parsed.data);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  ${String(i.path.join(".") || "(root)")}: ${i.message}`)
      .join("\n");
    throw new Error(`Schema validation failed for ${path}:\n${errors}`);
  }
  return { data: result.data as z.output<S>, body: parsed.content, sourcePath: path };
}

// ---- Artists ------------------------------------------------------------

export function getAllArtists(): ArtistDoc[] {
  return listMdxFiles(ARTISTS_DIR).map((name) => loadMdx(join(ARTISTS_DIR, name), artistSchema));
}

export function getArtistBySlug(slug: string): ArtistDoc | null {
  const path = join(ARTISTS_DIR, `${slug}.mdx`);
  if (!existsSync(path)) return null;
  return loadMdx(path, artistSchema);
}

// ---- Releases -----------------------------------------------------------

// Canonical release URL per SEO spec §2.1: /catalog/{catno-slug}. When a release
// has a catalog_number, the slug is prefixed with the lowercased catno; otherwise
// the plain slug is the URL segment.
export function catnoSlugFor(release: Release): string {
  if (release.catalog_number) {
    return `${release.catalog_number.toLowerCase()}-${release.slug}`;
  }
  return release.slug;
}

function releaseYearFromPath(path: string): number {
  // filename starts with YYYY-; derive year without depending on frontmatter release_date
  // (which may be missing for older vinyl releases).
  const name = path.split(/[\\/]/).pop() ?? "";
  const m = name.match(/^(\d{4})-/);
  return m ? parseInt(m[1], 10) : 0;
}

function resolveReleaseArtists(data: Release): NormalizedArtistRef[] {
  // Prefer the new `artists` array shape when present.
  if (data.artists && data.artists.length > 0) {
    return data.artists.map((a) => ({ slug: a.slug, name: a.name, role: a.role }));
  }
  // Fall back to single-artist + artists_additional.
  const refs: NormalizedArtistRef[] = [{ slug: data.artist, role: "primary" }];
  for (const slug of data.artists_additional) {
    if (slug && slug !== data.artist) refs.push({ slug, role: "primary" });
  }
  return refs;
}

export function getAllReleases(): ReleaseDoc[] {
  return listMdxFiles(RELEASES_DIR).map((name) => {
    const path = join(RELEASES_DIR, name);
    const loaded = loadMdx(path, releaseSchema);
    const catnoSlug = catnoSlugFor(loaded.data);
    return {
      ...loaded,
      year: releaseYearFromPath(path),
      catnoSlug,
      urlPath: `/catalog/${catnoSlug}`,
      resolvedArtists: resolveReleaseArtists(loaded.data),
    };
  });
}

export function getReleaseByCatnoSlug(catnoSlug: string): ReleaseDoc | null {
  // Cheap linear scan; catalog is small (tens of releases) so this is fine.
  return getAllReleases().find((r) => r.catnoSlug === catnoSlug) ?? null;
}

export function getReleasesByArtistSlug(artistSlug: string): ReleaseDoc[] {
  return getAllReleases().filter((r) => r.resolvedArtists.some((a) => a.slug === artistSlug));
}

// ---- News ---------------------------------------------------------------

function newsYearFromDoc(data: News, path: string): number {
  const m = data.date.match(/^(\d{4})/);
  if (m) return parseInt(m[1], 10);
  const nm = path.split(/[\\/]/).pop()?.match(/^(\d{4})-/);
  return nm ? parseInt(nm[1], 10) : 0;
}

export function getAllNews(): NewsDoc[] {
  return listMdxFiles(NEWS_DIR)
    .map((name) => {
      const path = join(NEWS_DIR, name);
      const loaded = loadMdx(path, newsSchema);
      const year = newsYearFromDoc(loaded.data, path);
      return {
        ...loaded,
        year,
        urlPath: `/news/${year}/${loaded.data.slug}`,
      };
    })
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export function getNewsBySlug(year: number, slug: string): NewsDoc | null {
  return getAllNews().find((n) => n.year === year && n.data.slug === slug) ?? null;
}

// ---- Campaign -----------------------------------------------------------

export function getCurrentCampaign(): Campaign {
  const path = join(CAMPAIGNS_DIR, "current.yml");
  const raw = readFileSync(path, "utf8");
  const data = YAML.parse(raw);
  const parsed = campaignSchema.safeParse(data);
  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Schema validation failed for ${path}:\n${errors}`);
  }
  return parsed.data;
}
