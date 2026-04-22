// Spec §8.4: 301 map generated from WP legacy slugs.
// Populated by scripts/redirects-build.ts into public/_redirects (Cloudflare Pages format).
// This module is the typed map for in-app consumers (e.g. redirect tests).

export type RedirectRule = {
  from: string;
  to: string;
  status: 301 | 302 | 410;
};

export const redirects: RedirectRule[] = [];
