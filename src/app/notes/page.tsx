import Link from "next/link";
import { BookOpen, ChevronRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllNotes, getPhases } from "@/lib/content";
import { getAvailableSubjects, getAllSubjects } from "@/lib/subjects";

export const metadata = {
  title: "Notes — All Subjects",
  description:
    "Browse structured learning notes across multiple programming subjects. Deep-dive coverage organized by learning phases for progressive mastery.",
  openGraph: {
    title: "Learning Notes | DevScribe",
    description:
      "Structured programming notes across multiple subjects. Deep-dive coverage organized for progressive mastery.",
  },
};

export default function NotesPage() {
  const available = getAvailableSubjects();
  const allSubjects = getAllSubjects();
  const comingSoon = allSubjects.filter(
    (s) => !available.find((a) => a.slug === s.slug)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Learning Library
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Choose a Subject
        </h1>
        <p className="max-w-lg text-muted-foreground">
          Deep-dive notes organized by learning phases. Pick a subject and start
          your journey from fundamentals to mastery.
        </p>
      </div>

      {/* Available subjects */}
      <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {available.map((subject) => {
          const phases = getPhases(subject.slug);
          const notes = getAllNotes(subject.slug);
          const totalTopics = phases.reduce((sum, p) => sum + p.noteCount, 0);

          return (
            <Link
              key={subject.slug}
              href={`/notes/${subject.slug}`}
              className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent/30 hover:shadow-sm hover:shadow-accent-glow"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${subject.bg}`}>
                  <BookOpen className={`h-5 w-5 ${subject.color}`} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <h2 className="mb-1 text-lg font-semibold transition-colors group-hover:text-accent">
                {subject.name}
              </h2>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {subject.description}
              </p>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-[10px]">
                  {phases.length} phases
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {totalTopics} notes
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Coming soon subjects */}
      {comingSoon.length > 0 && (
        <div>
          <h2 className="mb-6 text-lg font-semibold text-muted-foreground">
            Coming Soon
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comingSoon.map((subject) => (
              <div
                key={subject.slug}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface/50 p-5 opacity-60"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${subject.bg}`}>
                  <BookOpen className={`h-5 w-5 ${subject.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{subject.name}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      Soon
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {subject.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
