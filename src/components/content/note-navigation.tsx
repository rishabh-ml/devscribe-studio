import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { NoteMetadata } from "@/lib/content";

interface NoteNavigationProps {
  prev: NoteMetadata | null;
  next: NoteMetadata | null;
}

export function NoteNavigation({ prev, next }: NoteNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav className="relative mt-16 flex items-stretch gap-4 pt-8">
      {/* Gradient divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {prev ? (
        <Link
          href={`/notes/${prev.phaseSlug}/${prev.slug}`}
          className="group flex flex-1 flex-col rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30 hover:shadow-sm hover:shadow-accent-glow"
        >
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </span>
          <span className="text-sm font-medium transition-colors group-hover:text-accent">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/notes/${next.phaseSlug}/${next.slug}`}
          className="group flex flex-1 flex-col items-end rounded-xl border border-border bg-surface p-4 text-right transition-all hover:border-accent/30 hover:shadow-sm hover:shadow-accent-glow"
        >
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Next
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-sm font-medium transition-colors group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
