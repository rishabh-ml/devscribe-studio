import Link from "next/link";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPhases, getNotesByPhase } from "@/lib/content";

export const metadata = {
  title: "Notes",
  description: "Browse all JavaScript learning notes organized by phase",
};

export default function NotesPage() {
  const phases = getPhases();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-accent" />
          <Badge>JavaScript</Badge>
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          JavaScript Mastery Notes
        </h1>
        <p className="text-muted-foreground">
          10 phases, 60+ topics, 200+ concepts — from fundamentals to
          metaprogramming.
        </p>
      </div>

      <div className="space-y-8">
        {phases.map((phase) => {
          const notes = getNotesByPhase(phase.slug);
          return (
            <section key={phase.number}>
              <div className="mb-4 flex items-baseline gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-sm font-bold text-accent">
                  {phase.number}
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{phase.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {phase.noteCount} notes
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                {notes.map((note) => (
                  <Link
                    key={note.slug}
                    href={`/notes/${note.phaseSlug}/${note.slug}`}
                  >
                    <Card className="group transition-colors hover:border-accent/50 hover:bg-accent/5">
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-medium group-hover:text-accent">
                            {note.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {note.readingTime}
                            </span>
                            {note.tags?.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent" />
                      </CardContent>
                    </Card>
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
