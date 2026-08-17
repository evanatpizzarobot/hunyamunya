// Shared Spotify embed probing, used by spotify-verify.ts and spotify-import.ts.
//
// The thing worth knowing: a Spotify link can be perfectly valid and still
// render a blank player. Artist embeds are built from top-tracks popularity
// data, so a profile whose catalog only just went live resolves fine, returns
// the right name, and serves an empty tracklist. Album embeds carry their
// tracks directly and do not have this problem. Every check here is therefore
// about the tracklist, not the HTTP status.

export type Probe = { http: number; name: string | null; tracks: number | null };

export function embedUrl(url: string): { kind: string; id: string } | null {
  const m = url.match(
    /open\.spotify\.com\/(?:embed\/)?(album|track|playlist|artist|episode|show)\/([A-Za-z0-9]+)/,
  );
  return m ? { kind: m[1], id: m[2] } : null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Pulls the entity out of the embed page's __NEXT_DATA__ blob. `trackList` is
// what the widget renders, so an empty one means an empty player.
//
// Spotify throttles rapid sequential requests, and a throttled response looks
// exactly like an empty tracklist, so retry with backoff before believing a
// zero. `tracks: null` means the probe never got a usable answer, which is not
// the same finding as a confirmed empty player.
export async function probe(kind: string, id: string, attempts = 3): Promise<Probe> {
  let last: Probe = { http: 0, name: null, tracks: null };
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(500 * 2 ** i);
    try {
      const res = await fetch(`https://open.spotify.com/embed/${kind}/${id}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      last = { http: res.status, name: null, tracks: null };
      if (!res.ok) continue;
      const html = await res.text();
      const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (!m) continue;
      const entity = JSON.parse(m[1])?.props?.pageProps?.state?.data?.entity;
      const tracks = Array.isArray(entity?.trackList) ? entity.trackList.length : null;
      last = { http: res.status, name: entity?.name ?? null, tracks };
      // A real zero is stable, so only trust it once retries are exhausted.
      if (tracks !== null && tracks > 0) return last;
    } catch {
      // Network hiccup; fall through to the next attempt.
    }
  }
  return last;
}

// Normalised form for comparing a distributor's release title against a title
// in the content tree. Strips diacritics, punctuation and case so "Dune in Erf
// Minor" and "Dune In Erf Minor" match, without being loose enough to collide
// unrelated records.
export function normalizeTitle(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/["'‘’“”]/g, "")
    // Distributors and Discogs disagree on "&" vs "and" constantly.
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
