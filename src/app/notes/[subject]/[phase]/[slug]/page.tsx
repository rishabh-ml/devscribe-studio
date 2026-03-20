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
import { getAvailableSubjects, getSubject } from "@/lib/subjects";
import { preprocessMarkdown } from "@/lib/mdx";
import readingTime from "reading-time";

interface NotePageProps {
  params: Promise<{ subject: string; phase: string; slug: string }>;
}

export async function generateStaticParams() {
  const subjects = getAvailableSubjects();
  const params: { subject: string; phase: string; slug: string }[] = [];

  for (const s of subjects) {
    const notes = getAllNotes(s.slug);
    for (const n of notes) {
      params.push({ subject: s.slug, phase: n.phaseSlug, slug: n.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: NotePageProps) {
  const { subject: subjectSlug, phase, slug } = await params;
  const subject = getSubject(subjectSlug);
  const result = getNoteContent(phase, slug, subjectSlug);
  if (!subject || !result) return {};

  const { title, tags, phase: phaseNum } = result.frontmatter;
  const tagStr = tags?.slice(0, 5).join(", ") || "";
  const description = `Deep-dive ${subject.name} notes on ${title}. Phase ${phaseNum} — covers ${tagStr}. Structured for progressive mastery.`;

  return {
    title: `${title} — ${subject.name}`,
    description,
    openGraph: {
      title: `${title} | ${subject.name} | DevScribe`,
      description,
      type: "article",
      tags: tags,
    },
    twitter: {
      card: "summary",
      title: `${title} | DevScribe`,
      description,
    },
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { subject: subjectSlug, phase, slug } = await params;
  const subject = getSubject(subjectSlug);
  const result = getNoteContent(phase, slug, subjectSlug);

  if (!subject || !result) {
    notFound();
  }

  const { frontmatter, content } = result;
  const { prev, next } = getAdjacentNotes(phase, slug, subjectSlug);
  const processedContent = preprocessMarkdown(content);

  const noteMetadata = {
    ...frontmatter,
    slug,
    phaseSlug: phase,
    subject: subjectSlug,
    readingTime: readingTime(content).text,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description: `${subject.name} notes on ${frontmatter.title}`,
    datePublished: frontmatter.created,
    author: { "@type": "Organization", name: "DevScribe" },
    publisher: { "@type": "Organization", name: "DevScribe" },
    keywords: frontmatter.tags?.join(", "),
    articleSection: `${subject.name} — Phase ${frontmatter.phase}`,
    url: `https://devscribe.studio/notes/${subjectSlug}/${phase}/${slug}`,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back nav */}
      <Link href={`/notes/${subjectSlug}/${phase}`}>
        <Button variant="ghost" size="sm" className="mb-8 gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" />
          Phase {frontmatter.phase}
        </Button>
      </Link>

      <article>
        <NoteHeader note={noteMetadata} />
        <MdxContent source={processedContent} />
      </article>

      <NoteNavigation prev={prev} next={next} subject={subjectSlug} />
    </div>
  );
}
