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
            {/* lane 1 — dolphin/tuna profile: elongated body with subtle dorsal hump */}
            <symbol id="silShadowLong" viewBox="0 0 240 60">
              <path d="M0 32 Q 16 16, 58 12 Q 100 6, 140 10 Q 158 2, 174 7 Q 200 14, 222 22 Q 238 28, 240 32 Q 232 46, 198 50 Q 130 56, 60 50 Q 16 46, 0 32 Z" />
            </symbol>
            {/* lane 2 — manta ray: wide wings, narrow body */}
            <symbol id="silShadowRound" viewBox="0 0 100 60">
              <path d="M50 12 Q 78 14, 96 26 Q 98 34, 86 44 Q 70 52, 56 52 Q 50 54, 50 56 Q 50 54, 44 52 Q 30 52, 14 44 Q 2 34, 4 26 Q 22 14, 50 12 Z" />
            </symbol>
            {/* lane 3 — head-heavy grouper: asymmetric, fatter on the left */}
            <symbol id="silShadowOblong" viewBox="0 0 140 50">
              <path d="M0 25 Q 6 6, 32 4 Q 66 2, 96 8 Q 118 12, 132 22 Q 138 26, 134 32 Q 122 40, 96 42 Q 60 44, 30 40 Q 8 36, 0 25 Z" />
            </symbol>
            {/* lane 4 — eel: very long, thin, slight body wave */}
            <symbol id="silShadowNarrow" viewBox="0 0 120 24">
              <path d="M0 12 Q 14 4, 38 5 Q 62 3, 86 8 Q 104 6, 116 12 Q 120 13, 116 16 Q 100 21, 78 19 Q 50 22, 28 20 Q 10 18, 0 12 Z" />
            </symbol>
            {/* lane 5 — humpback whale: massive, slight back hump and tail taper */}
            <symbol id="silShadowWhale" viewBox="0 0 360 80">
              <path d="M0 40 Q 22 18, 70 12 Q 140 6, 210 10 Q 244 4, 274 13 Q 320 22, 356 36 Q 360 40, 356 44 Q 332 58, 286 64 Q 200 70, 100 66 Q 28 62, 0 40 Z" />
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
