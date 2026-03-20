import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ChevronRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNotesByPhase, getPhases } from "@/lib/content";
import { getAvailableSubjects, getSubject } from "@/lib/subjects";

interface PhasePageProps {
  params: Promise<{ subject: string; phase: string }>;
}

export async function generateStaticParams() {
  const subjects = getAvailableSubjects();
  const params: { subject: string; phase: string }[] = [];

  for (const s of subjects) {
    const phases = getPhases(s.slug);
    for (const p of phases) {
      params.push({ subject: s.slug, phase: p.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PhasePageProps) {
  const { subject: subjectSlug, phase: phaseSlug } = await params;
  const subject = getSubject(subjectSlug);
  const notes = getNotesByPhase(phaseSlug, subjectSlug);
  if (!subject || notes.length === 0) return {};

  const overview = notes.find((n) => n.slug.includes("overview"));
  const phaseNumber = notes[0].phase;
  const title = overview?.title || `Phase ${phaseNumber}`;

  return {
    title: `${title} — ${subject.name}`,
    description: `Phase ${phaseNumber} of ${subject.name} mastery: ${title}. ${notes.length} in-depth notes covering ${notes.map((n) => n.title).slice(1, 4).join(", ")}${notes.length > 4 ? ", and more" : ""}.`,
    openGraph: {
      title: `${title} | ${subject.name} | DevScribe`,
      description: `Phase ${phaseNumber}: ${notes.length} structured ${subject.name} notes.`,
    },
  };
}

export default async function PhasePage({ params }: PhasePageProps) {
  const { subject: subjectSlug, phase: phaseSlug } = await params;
  const subject = getSubject(subjectSlug);
  const notes = getNotesByPhase(phaseSlug, subjectSlug);

  if (!subject || notes.length === 0) {
    notFound();
  }

  const overview = notes.find((n) => n.slug.includes("overview"));
  const phaseNumber = notes[0].phase;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Back */}
      <Link href={`/notes/${subjectSlug}`}>
        <Button variant="ghost" size="sm" className="mb-8 gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" />
          {subject.name} Notes
        </Button>
      </Link>

      {/* Phase header */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 font-mono text-sm font-bold text-accent">
            {String(phaseNumber).padStart(2, "0")}
          </div>
          <Badge variant="glow">Phase {phaseNumber}</Badge>
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {overview?.title || `Phase ${phaseNumber}`}
        </h1>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          {notes.length} notes in this phase
        </p>
      </div>

      {/* Notes grid */}
      <div className="space-y-1.5">
        {notes.map((note, i) => (
          <Link
            key={note.slug}
            href={`/notes/${subjectSlug}/${note.phaseSlug}/${note.slug}`}
            className="group flex items-center gap-4 rounded-xl border border-transparent p-4 transition-all hover:border-border hover:bg-surface"
          >
            {/* Index number */}
            <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground/50">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium transition-colors group-hover:text-accent">
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
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        ))}
      </div>
    </div>
  );
}
