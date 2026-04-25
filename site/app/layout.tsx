import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AmbientBackground } from "@/components/AmbientBackground";
import { orgSchema, LABEL_NAME, SITE_URL } from "@/lib/jsonld";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const interSerif = Inter({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const interMono = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${LABEL_NAME} · LA Boutique Label, Electronic Ambient Chillout since 2002`,
    template: `%s · ${LABEL_NAME}`,
  },
  description:
    "LA based boutique label and publisher since 2002. Hunya Munya Records crafts Electronic, Ambient, Breaks, and Chillout for Radio, Film, and TV, plus collectible limited Vinyl and CDs worldwide.",
  openGraph: {
    siteName: LABEL_NAME,
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

// Clamp mobile viewport to a fixed zoom. Prevents iOS Safari from letting
// users pinch-zoom-out past 1.0, which exposed side whitespace and felt
// broken on mobile. Horizontal overflow is also locked in globals.css; this
// stops the zoom-gesture path that can produce the same bug state.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interMono.variable} ${interSerif.variable}`}
    >
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="antialiased text-neutral-100">
        <AmbientBackground />
        {/* Underwater ambient layer sprite. Five abstract shadow blobs (varying
            aspect ratios so they read as different unseen creatures passing
            overhead) consumed via <use> in site/app/page.tsx. Pivoted from the
            original anatomical silhouettes — shadows have no front/back, which
            kills the directionality bug, and pure black on near-black water
            registers as a void rather than a same-color blur. */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            {/* lane 1 — whale-form: asymmetric body with a tail-end taper.
                Reads as a large creature in profile, never literal. */}
            <symbol id="silShadowLong" viewBox="0 0 240 60">
              <path d="M0 32 Q 12 14, 50 10 Q 112 4, 176 12 Q 214 18, 234 26 L 240 32 L 234 38 Q 218 44, 198 48 Q 130 56, 60 50 Q 14 46, 0 32 Z" />
            </symbol>
            {/* lane 2 — jellyfish-form: round dome with five small notches
                along the bottom, evoking a soft skirt without committing
                to tentacles or anatomy. */}
            <symbol id="silShadowRound" viewBox="0 0 100 60">
              <path d="M50 6 Q 90 6, 96 30 Q 96 44, 88 52 Q 80 50, 72 52 Q 64 50, 56 52 Q 48 50, 40 52 Q 32 50, 24 52 Q 16 50, 12 52 Q 4 44, 4 30 Q 10 6, 50 6 Z" />
            </symbol>
            {/* lane 3 — lemon-form: both ends tapered, smooth midline.
                Single creature in profile, fish-like in the abstract. */}
            <symbol id="silShadowOblong" viewBox="0 0 140 50">
              <path d="M0 25 Q 30 6, 70 6 Q 110 6, 140 25 Q 110 44, 70 44 Q 30 44, 0 25 Z" />
            </symbol>
            {/* lane 4 — school-form: two close narrow ovals at slight
                offset and different vertical positions. Reads as a small
                cluster moving together rather than one shape. */}
            <symbol id="silShadowNarrow" viewBox="0 0 120 24">
              <path d="M2 10 Q 14 4, 36 5 Q 60 4, 78 8 Q 86 10, 78 13 Q 60 16, 36 14 Q 14 14, 2 10 Z M28 17 Q 42 14, 64 16 Q 88 17, 102 20 Q 110 22, 100 24 Q 86 24, 64 22 Q 42 22, 28 17 Z" />
            </symbol>
            {/* lane 5 — manta-form: wide near the middle, tapered at both
                extremes. Reads as something flat and enormous gliding past,
                like a ray or a school passing as one body. */}
            <symbol id="silShadowWhale" viewBox="0 0 360 80">
              <path d="M2 40 Q 60 30, 120 20 Q 180 8, 240 20 Q 300 30, 358 40 Q 300 50, 240 60 Q 180 72, 120 60 Q 60 50, 2 40 Z" />
            </symbol>
          </defs>
        </svg>
        <SEO jsonLd={[orgSchema()]} />
        <Header />
        <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
