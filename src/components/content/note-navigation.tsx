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
    <nav className="mt-12 flex items-stretch gap-4 border-t border-border pt-8">
      {prev ? (
        <Link
          href={`/notes/${prev.phaseSlug}/${prev.slug}`}
          className="group flex flex-1 flex-col rounded-xl border border-border p-4 transition-colors hover:bg-muted"
        >
          <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="h-3 w-3" />
            Previous
          </span>
          <span className="text-sm font-medium group-hover:text-accent">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/notes/${next.phaseSlug}/${next.slug}`}
          className="group flex flex-1 flex-col items-end rounded-xl border border-border p-4 text-right transition-colors hover:bg-muted"
        >
          <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            Next
            <ArrowRight className="h-3 w-3" />
          </span>
          <span className="text-sm font-medium group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
