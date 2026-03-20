import type { Metadata } from "next";
import { Sora, Newsreader, Fira_Code } from "next/font/google";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://devscribe.studio";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DevScribe — AI-Powered Learning Notebook for Developers",
    template: "%s | DevScribe",
  },
  description:
    "Master programming with structured, in-depth notes organized by learning phases. 10 phases, 64 topics, 200+ concepts — from fundamentals to advanced patterns.",
  keywords: [
    "learn javascript",
    "javascript notes",
    "programming tutorial",
    "developer notebook",
    "coding notes",
    "javascript mastery",
    "learn to code",
    "web development",
  ],
  authors: [{ name: "DevScribe" }],
  creator: "DevScribe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "DevScribe",
    title: "DevScribe — AI-Powered Learning Notebook for Developers",
    description:
      "Master programming with structured, in-depth notes. 10 phases, 64 topics, 200+ concepts — from fundamentals to advanced patterns.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevScribe — AI-Powered Learning Notebook for Developers",
    description:
      "Master programming with structured, in-depth notes. 10 phases, 64 topics, 200+ concepts.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${newsreader.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="noise-bg flex min-h-full flex-col bg-background font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "DevScribe",
              url: BASE_URL,
              description:
                "AI-powered learning notebook for developers with structured notes, learning phases, and progressive mastery paths.",
              potentialAction: {
                "@type": "SearchAction",
                target: `${BASE_URL}/notes?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Navigation />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
