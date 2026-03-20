import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MdxContent } from "@/components/content/mdx-content";
import { NoteHeader } from "@/components/content/note-header";
import { NoteNavigation } from "@/components/content/note-navigation";
import {
  getAllNotes,
  getNoteContent,
  getAdjacentNotes,
} from "@/lib/content";
import { preprocessMarkdown } from "@/lib/mdx";
import readingTime from "reading-time";

interface NotePageProps {
  params: Promise<{ phase: string; slug: string }>;
}

export async function generateStaticParams() {
  const notes = getAllNotes();
  return notes.map((n) => ({ phase: n.phaseSlug, slug: n.slug }));
}

export async function generateMetadata({ params }: NotePageProps) {
  const { phase, slug } = await params;
  const result = getNoteContent(phase, slug);
  if (!result) return {};

  return {
    title: result.frontmatter.title,
    description: `JavaScript notes — ${result.frontmatter.title}`,
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { phase, slug } = await params;
  const result = getNoteContent(phase, slug);

  if (!result) {
    notFound();
  }

  const { frontmatter, content } = result;
  const { prev, next } = getAdjacentNotes(phase, slug);
  const processedContent = preprocessMarkdown(content);

  const noteMetadata = {
    ...frontmatter,
    slug,
    phaseSlug: phase,
    readingTime: readingTime(content).text,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Back nav */}
      <Link href={`/notes/${phase}`}>
        <Button variant="ghost" size="sm" className="mb-8 gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" />
          Phase {frontmatter.phase}
        </Button>
      </Link>

      <article>
        <NoteHeader note={noteMetadata} />
        <MdxContent source={processedContent} />
      </article>

      <NoteNavigation prev={prev} next={next} />
    </div>
  );
}
