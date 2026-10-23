import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { BackgroundEngine } from "@/components/background/BackgroundEngine";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/data/site";
import "katex/dist/katex.min.css";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

const canonical = absoluteUrl("/");
const ogImage = {
  url: absoluteUrl("/og.png"),
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Marc Gian R. Reantaso. Where logic meets geometry.",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: "Marc Gian R. Reantaso. Where Logic Meets Geometry",
    template: "%s · Marc Gian R. Reantaso",
  },
  description: site.description,
  keywords: [
    "Marc Gian Reantaso",
    "software engineer portfolio",
    "full-stack developer Philippines",
    "compiler design",
    "PseudoPy",
    "AgriGuard",
    "offline-first PWA",
    "Next.js portfolio",
    "Pamantasan ng Cabuyao",
    "computer science student",
  ],
  authors: [{ name: site.name, url: site.github }],
  creator: site.name,
  alternates: { canonical },
  openGraph: {
    type: "website",
    url: canonical,
    title: "Marc Gian R. Reantaso. Where Logic Meets Geometry",
    description: site.description,
    siteName: site.name,
    locale: "en_PH",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marc Gian R. Reantaso. Where Logic Meets Geometry",
    description: site.description,
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#08080A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: canonical,
  email: `mailto:${site.email}`,
  jobTitle: site.role,
  description: site.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cabuyao",
    addressRegion: "Laguna",
    addressCountry: "PH",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: site.school,
  },
  knowsAbout: [
    "Compiler design",
    "Static program analysis",
    "Full-stack web development",
    "Progressive web apps",
    "Offline-first architecture",
    "Algorithmic complexity",
    "Precision agriculture IoT",
  ],
  sameAs: [site.github, site.linkedin, site.facebook],
  award: `${site.award.placement}: ${site.award.title}`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-void font-sans text-ink antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <BackgroundEngine />

        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 grid-overlay opacity-60" />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(0,240,255,0.09),transparent_55%),radial-gradient(ellipse_at_85%_15%,rgba(139,92,246,0.07),transparent_50%),radial-gradient(ellipse_at_10%_80%,rgba(16,185,129,0.06),transparent_45%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(8,8,10,0.75)_100%)]"
        />

        <Navbar />

        <main id="main" className="relative z-10">
          {children}
        </main>

        <Footer />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <noscript>
          <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-lg border border-line bg-space p-4 text-xs text-muted">
            This portfolio uses JavaScript for its interactive math visualizations. All written
            content remains available without it.
          </div>
        </noscript>
      </body>
    </html>
  );
}
