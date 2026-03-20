import Link from "next/link";
import { BookOpen, Clock, ChevronRight, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPhases, getNotesByPhase } from "@/lib/content";

export const metadata = {
  title: "Notes",
  description: "Browse all JavaScript learning notes organized by phase",
};

export default function NotesPage() {
  const phases = getPhases();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="mb-3 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            JavaScript
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Mastery Notes
        </h1>
        <p className="max-w-lg text-muted-foreground">
          10 phases, 64 topics, 200+ concepts — from fundamentals to
          metaprogramming. Start anywhere, go deep.
        </p>
      </div>

      {/* Phase list */}
      <div className="space-y-12">
        {phases.map((phase) => {
          const notes = getNotesByPhase(phase.slug);
          return (
            <section key={phase.number}>
              {/* Phase header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 font-mono text-sm font-bold text-accent">
                  {String(phase.number).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="font-semibold">{phase.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {phase.noteCount} notes
                  </p>
                </div>
              </div>

              {/* Notes list */}
              <div className="ml-[18px] space-y-0.5 border-l border-border pl-6">
                {notes.map((note) => (
                  <Link
                    key={note.slug}
                    href={`/notes/${note.phaseSlug}/${note.slug}`}
                    className="group -ml-[25px] flex items-center gap-4 rounded-lg py-2.5 pl-[25px] pr-3 transition-all hover:bg-surface"
                  >
                    {/* Dot on timeline */}
                    <div className="absolute -ml-[25px] h-2 w-2 rounded-full border-2 border-border bg-background transition-colors group-hover:border-accent group-hover:bg-accent" />

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium transition-colors group-hover:text-accent">
                        {note.title}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          {note.readingTime}
                        </span>
                        {note.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-muted-foreground/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
