import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface SubjectInfo {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
}

const SUBJECT_META: Record<string, Omit<SubjectInfo, "slug">> = {
  javascript: {
    name: "JavaScript",
    description:
      "From fundamentals to metaprogramming — master every corner of the language.",
    icon: "Terminal",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  typescript: {
    name: "TypeScript",
    description:
      "Type-safe JavaScript — interfaces, generics, advanced types, and compiler mastery.",
    icon: "FileCode",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  python: {
    name: "Python",
    description:
      "From basics to advanced patterns — data structures, OOP, async, and Pythonic idioms.",
    icon: "Code",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  react: {
    name: "React",
    description:
      "Component architecture, hooks, state management, patterns, and performance.",
    icon: "Atom",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  "node-js": {
    name: "Node.js",
    description:
      "Server-side JavaScript — event loop, streams, APIs, databases, and deployment.",
    icon: "Server",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  "data-structures": {
    name: "Data Structures & Algorithms",
    description:
      "Arrays, trees, graphs, sorting, searching, and algorithmic thinking.",
    icon: "GitBranch",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
};

/** Returns subjects that actually have content directories on disk. */
export function getAvailableSubjects(): SubjectInfo[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const dirs = fs.readdirSync(CONTENT_DIR).filter((d) =>
    fs.statSync(path.join(CONTENT_DIR, d)).isDirectory()
  );

  return dirs
    .filter((slug) => SUBJECT_META[slug])
    .map((slug) => ({ slug, ...SUBJECT_META[slug] }));
}

/** Returns all known subjects (including those without content yet). */
export function getAllSubjects(): SubjectInfo[] {
  return Object.entries(SUBJECT_META).map(([slug, meta]) => ({
    slug,
    ...meta,
  }));
}

/** Look up a single subject by slug. */
export function getSubject(slug: string): SubjectInfo | null {
  const meta = SUBJECT_META[slug];
  if (!meta) return null;
  return { slug, ...meta };
}
