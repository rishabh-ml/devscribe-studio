import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ChevronRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPhases, getNotesByPhase } from "@/lib/content";
import { getAvailableSubjects, getSubject } from "@/lib/subjects";

interface SubjectPageProps {
  params: Promise<{ subject: string }>;
}

export async function generateStaticParams() {
  const subjects = getAvailableSubjects();
  return subjects.map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({ params }: SubjectPageProps) {
  const { subject: subjectSlug } = await params;
  const subject = getSubject(subjectSlug);
  if (!subject) return {};

  return {
    title: `${subject.name} Notes`,
    description: subject.description,
    openGraph: {
      title: `${subject.name} Mastery Notes | DevScribe`,
      description: subject.description,
    },
  };
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subject: subjectSlug } = await params;
  const subject = getSubject(subjectSlug);

  if (!subject) {
    notFound();
  }

  const phases = getPhases(subjectSlug);

  if (phases.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Back */}
      <Link href="/notes">
        <Button variant="ghost" size="sm" className="mb-8 gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" />
          All Subjects
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-12">
        <Badge variant="glow" className="mb-3">{subject.name}</Badge>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {subject.name} Mastery Notes
        </h1>
        <p className="max-w-lg text-muted-foreground">
          {subject.description}
        </p>
      </div>

      {/* Phase list */}
      <div className="space-y-12">
        {phases.map((phase) => {
          const notes = getNotesByPhase(phase.slug, subjectSlug);
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
                    href={`/notes/${subjectSlug}/${note.phaseSlug}/${note.slug}`}
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
