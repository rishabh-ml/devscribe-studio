import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNotesByPhase, getPhases } from "@/lib/content";

interface PhasePageProps {
  params: Promise<{ phase: string }>;
}

export async function generateStaticParams() {
  const phases = getPhases();
  return phases.map((p) => ({ phase: p.slug }));
}

export default async function PhasePage({ params }: PhasePageProps) {
  const { phase: phaseSlug } = await params;
  const notes = getNotesByPhase(phaseSlug);

  if (notes.length === 0) {
    notFound();
  }

  const overview = notes.find((n) => n.slug.includes("overview"));
  const phaseNumber = notes[0].phase;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/notes">
        <Button variant="ghost" size="sm" className="mb-6 gap-1">
          <ArrowLeft className="h-3 w-3" />
          All Notes
        </Button>
      </Link>

      <div className="mb-10">
        <Badge className="mb-3">Phase {phaseNumber}</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          {overview?.title || `Phase ${phaseNumber}`}
        </h1>
        <p className="text-muted-foreground">
          {notes.length} notes in this phase
        </p>
      </div>

      <div className="grid gap-2">
        {notes.map((note) => (
          <Link key={note.slug} href={`/notes/${note.phaseSlug}/${note.slug}`}>
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
    </div>
  );
}
