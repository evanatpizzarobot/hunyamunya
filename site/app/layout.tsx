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
        {/* Underwater ambient layer sprite. Defines <symbol> references the
            home page (and future Phase 2/3 pages) consume via <use>. Loaded
            once per page in the shared layout. Phase 1 only renders 5 of
            the 8 symbols; the rest are scaffold for later phases. */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <symbol id="silCormorant" viewBox="0 0 120 60">
              <path d="M2 30 Q 10 18, 28 16 L 42 8 Q 50 12, 52 22 Q 72 22, 92 28 L 116 22 L 110 32 L 118 40 L 96 36 Q 76 42, 56 38 L 50 50 Q 42 46, 40 38 Q 18 38, 2 30 Z" />
            </symbol>
            <symbol id="silCod" viewBox="0 0 140 50">
              <path d="M0 25 Q 16 8, 44 10 Q 78 12, 102 20 L 122 12 Q 130 14, 132 18 L 140 8 L 136 25 L 140 42 L 132 32 Q 130 36, 122 38 L 102 30 Q 78 38, 44 40 Q 16 42, 0 25 Z" />
            </symbol>
            <symbol id="silMackerel" viewBox="0 0 100 32">
              <path d="M0 16 Q 14 4, 38 6 Q 62 8, 78 14 L 92 6 L 88 16 L 92 26 L 78 18 Q 62 24, 38 26 Q 14 28, 0 16 Z" />
            </symbol>
            <symbol id="silShark" viewBox="0 0 240 60">
              <path d="M0 32 Q 30 22, 70 24 L 88 8 Q 96 16, 96 26 Q 130 22, 168 28 Q 198 30, 224 24 L 240 12 L 234 30 L 240 48 L 224 36 Q 198 32, 168 34 Q 130 40, 96 36 Q 96 46, 88 54 L 70 38 Q 30 40, 0 32 Z" />
            </symbol>
            <symbol id="silROV" viewBox="0 0 100 70">
              <rect x="14" y="20" width="72" height="34" rx="2" />
              <rect x="20" y="10" width="14" height="10" />
              <rect x="66" y="10" width="14" height="10" />
              <rect x="10" y="56" width="80" height="3" />
              <rect x="14" y="59" width="4" height="6" />
              <rect x="82" y="59" width="4" height="6" />
              <path d="M50 10 Q 48 4, 52 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </symbol>
            <symbol id="silKelp" viewBox="0 0 30 200">
              <path d="M14 0 Q 8 40, 16 80 Q 22 120, 12 160 Q 6 180, 14 200 L 18 200 Q 12 180, 18 160 Q 28 120, 22 80 Q 14 40, 18 0 Z" />
            </symbol>
            <symbol id="silJelly" viewBox="0 0 60 90">
              <path d="M30 4 Q 6 4, 6 30 L 8 36 L 12 30 L 16 38 L 20 30 L 24 38 L 28 30 L 32 38 L 36 30 L 40 38 L 44 30 L 48 38 L 52 30 L 54 36 L 54 30 Q 54 4, 30 4 Z" />
              <path d="M14 38 Q 12 60, 18 84" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <path d="M22 38 Q 24 56, 20 86" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <path d="M30 38 Q 28 64, 32 88" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <path d="M38 38 Q 40 60, 36 86" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <path d="M46 38 Q 48 56, 42 84" stroke="currentColor" strokeWidth="0.8" fill="none" />
            </symbol>
            <symbol id="silChain" viewBox="0 0 16 200">
              <ellipse cx="8" cy="6" rx="5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="8" cy="14" rx="3" ry="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="8" cy="24" rx="5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="8" cy="32" rx="3" ry="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
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
