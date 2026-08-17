// Single source of truth for Spotify embeds across the site. Release pages,
// artist pages and the home page featured slot all funnel through here so the
// URL normalisation and iframe attributes stay identical everywhere.

// Accepts any open.spotify.com link (album, track, playlist, artist, episode,
// show), with or without the /embed/ segment already in it, and returns the
// canonical embed URL. Returns null for anything that isn't a Spotify link so
// callers can render nothing rather than an empty iframe.
export function spotifyEmbedFrom(url: string): string | null {
  const m = url.match(
    /open\.spotify\.com\/(?:embed\/)?(album|track|playlist|artist|episode|show)\/([A-Za-z0-9]+)/,
  );
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

export default function SpotifyPlayer({
  url,
  title,
  caption,
  className = "",
}: {
  url: string | null | undefined;
  title: string;
  caption?: string;
  className?: string;
}) {
  const src = url ? spotifyEmbedFrom(url) : null;
  if (!src) return null;

  return (
    <div className={className}>
      <div className="w-full overflow-hidden rounded-xl">
        <iframe
          src={src}
          title={title}
          width="100%"
          height={352}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="block border-0"
        />
      </div>
      {caption ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
