import Link from "next/link";
import { Zap, Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border/50">
      {/* Gradient border glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15">
                <Zap className="h-3 w-3 text-accent" />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Dev<span className="text-accent">Scribe</span>.studio
              </span>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              An AI-powered learning notebook for developers.
              Structured for progressive mastery.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Learn
              </h4>
              <nav className="flex flex-col gap-1.5">
                <Link
                  href="/notes"
                  className="text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  All Notes
                </Link>
                <Link
                  href="/notes/phase-1-language-foundations/01-phase-1-overview"
                  className="text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  Start Phase 1
                </Link>
              </nav>
            </div>
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Project
              </h4>
              <nav className="flex flex-col gap-1.5">
                <a
                  href="https://github.com/rishabh-ml/devscribe-studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  <Github className="h-3 w-3" />
                  Source
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-border/50 pt-6">
          <p className="text-xs text-muted-foreground">
            Built with Next.js, Tailwind CSS &amp; Framer Motion.
          </p>
        </div>
      </div>
    </footer>
  );
}
