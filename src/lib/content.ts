import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface NoteFrontmatter {
  title: string;
  phase: number;
  topic?: string;
  tags: string[];
  created: string;
  timeframe?: string;
}

export interface NoteMetadata extends NoteFrontmatter {
  slug: string;
  phaseSlug: string;
  subject: string;
  readingTime: string;
}

export interface PhaseInfo {
  number: number;
  slug: string;
  title: string;
  noteCount: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getPhaseDir(dir: string): { number: number; slug: string } | null {
  const match = dir.match(/^Phase (\d+)/);
  if (!match) return null;
  return { number: parseInt(match[1], 10), slug: slugify(dir) };
}

export function getAllNotes(subject = "javascript"): NoteMetadata[] {
  const subjectDir = path.join(CONTENT_DIR, subject);
  if (!fs.existsSync(subjectDir)) return [];

  const notes: NoteMetadata[] = [];
  const phaseDirs = fs.readdirSync(subjectDir).filter((d) => {
    return (
      d.startsWith("Phase") &&
      fs.statSync(path.join(subjectDir, d)).isDirectory()
    );
  });

  for (const dir of phaseDirs) {
    const phaseInfo = getPhaseDir(dir);
    if (!phaseInfo) continue;

    const phaseDir = path.join(subjectDir, dir);
    const files = fs.readdirSync(phaseDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(phaseDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const fm = data as NoteFrontmatter;

      notes.push({
        ...fm,
        slug: slugify(file.replace(/\.md$/, "")),
        phaseSlug: phaseInfo.slug,
        subject,
        readingTime: readingTime(content).text,
      });
    }
  }

  return notes.sort((a, b) => {
    if (a.phase !== b.phase) return a.phase - b.phase;
    return a.slug.localeCompare(b.slug);
  });
}

export function getPhases(subject = "javascript"): PhaseInfo[] {
  const notes = getAllNotes(subject);
  const phaseMap = new Map<number, PhaseInfo>();

  for (const note of notes) {
    if (!phaseMap.has(note.phase)) {
      phaseMap.set(note.phase, {
        number: note.phase,
        slug: note.phaseSlug,
        title: "",
        noteCount: 0,
      });
    }
    const phase = phaseMap.get(note.phase)!;
    phase.noteCount++;

    // Use the overview note's title as the phase title
    if (note.slug.includes("overview")) {
      phase.title = note.title;
    }
  }

  return Array.from(phaseMap.values()).sort((a, b) => a.number - b.number);
}

export function getNotesByPhase(
  phaseSlug: string,
  subject = "javascript"
): NoteMetadata[] {
  return getAllNotes(subject).filter((n) => n.phaseSlug === phaseSlug);
}

export function getNoteContent(
  phaseSlug: string,
  noteSlug: string,
  subject = "javascript"
): { frontmatter: NoteFrontmatter; content: string } | null {
  const subjectDir = path.join(CONTENT_DIR, subject);
  if (!fs.existsSync(subjectDir)) return null;

  const phaseDirs = fs.readdirSync(subjectDir).filter((d) => {
    return (
      d.startsWith("Phase") &&
      fs.statSync(path.join(subjectDir, d)).isDirectory()
    );
  });

  for (const dir of phaseDirs) {
    const phaseInfo = getPhaseDir(dir);
    if (!phaseInfo || phaseInfo.slug !== phaseSlug) continue;

    const phaseDir = path.join(subjectDir, dir);
    const files = fs.readdirSync(phaseDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const slug = slugify(file.replace(/\.md$/, ""));
      if (slug !== noteSlug) continue;

      const raw = fs.readFileSync(path.join(phaseDir, file), "utf-8");
      const { data, content } = matter(raw);
      return { frontmatter: data as NoteFrontmatter, content };
    }
  }

  return null;
}

export function getAdjacentNotes(
  phaseSlug: string,
  noteSlug: string,
  subject = "javascript"
): { prev: NoteMetadata | null; next: NoteMetadata | null } {
  const allNotes = getAllNotes(subject);
  const index = allNotes.findIndex(
    (n) => n.phaseSlug === phaseSlug && n.slug === noteSlug
  );

  return {
    prev: index > 0 ? allNotes[index - 1] : null,
    next: index < allNotes.length - 1 ? allNotes[index + 1] : null,
  };
}
