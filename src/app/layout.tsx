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

export const metadata: Metadata = {
  title: {
    default: "DevScribe — AI-Powered Learning Notebook",
    template: "%s | DevScribe",
  },
  description:
    "A personal AI-powered learning notebook for developers. Structured notes, video lectures, mindmaps, quizzes, and curated learning paths.",
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
        <Navigation />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
