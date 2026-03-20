"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  ArrowRight,
  FileText,
  Video,
  Brain,
  HelpCircle,
  Presentation,
  Route,
  Terminal,
  Layers,
  Sparkles,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fadeInUp,
  heroReveal,
  staggerContainer,
  staggerContainerSlow,
  cardHover,
} from "@/lib/motion";

const contentTypes = [
  {
    icon: FileText,
    title: "Structured Notes",
    description: "Obsidian-style notes organized by learning phases",
    available: true,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Video,
    title: "Video Overviews",
    description: "AI-generated video lectures via NotebookLM",
    available: false,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    icon: Brain,
    title: "Mindmaps",
    description: "Interactive visual mindmaps for topic exploration",
    available: false,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: HelpCircle,
    title: "Quizzes",
    description: "Self-assessment quizzes tied to learning topics",
    available: false,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Presentation,
    title: "Slides",
    description: "Slide decks for visual learners",
    available: false,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    icon: Route,
    title: "Learning Paths",
    description: "Curated sequences linking resources together",
    available: false,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

const subjects = [
  { slug: "javascript", name: "JavaScript", icon: Terminal, color: "text-amber-500", bg: "bg-amber-500/10", phases: 10, notes: 76, available: true },
  { slug: "typescript", name: "TypeScript", icon: Code, color: "text-sky-400", bg: "bg-sky-400/10", phases: 0, notes: 0, available: false },
  { slug: "python", name: "Python", icon: Code, color: "text-emerald-400", bg: "bg-emerald-400/10", phases: 0, notes: 0, available: false },
  { slug: "react", name: "React", icon: Code, color: "text-cyan-400", bg: "bg-cyan-400/10", phases: 0, notes: 0, available: false },
];

const stats = [
  { label: "Subjects", value: "6" },
  { label: "Phases", value: "10+" },
  { label: "Notes", value: "76" },
  { label: "Concepts", value: "200+" },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* ─── Hero ─────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Dot grid background */}
        <div className="dot-grid absolute inset-0 opacity-40" />

        {/* Radial glow behind hero */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-accent/5 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            className="flex flex-col items-center pb-16 pt-20 text-center sm:pb-24 sm:pt-28"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={heroReveal}>
              <Badge variant="glow" className="mb-6">
                <Sparkles className="mr-1 h-3 w-3" />
                AI-Powered Learning Notebook
              </Badge>
            </motion.div>

            <motion.h1
              variants={heroReveal}
              className="mb-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl"
            >
              Learn to Code.{" "}
              <span className="gradient-text">Deeply.</span>
            </motion.h1>

            <motion.p
              variants={heroReveal}
              className="mb-10 max-w-2xl font-serif text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              A structured knowledge base for developers — organized by subject
              and learning phase for progressive mastery from fundamentals
              through advanced patterns and real-world practice.
            </motion.p>

            <motion.div
              variants={heroReveal}
              className="mb-16 flex flex-wrap items-center justify-center gap-3"
            >
              <Link href="/notes">
                <Button variant="glow" size="lg" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Browse Subjects
                </Button>
              </Link>
              <Link href="/notes/javascript">
                <Button variant="outline" size="lg" className="gap-2">
                  Start JavaScript
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={heroReveal}
              className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold tracking-tight text-accent sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ─── Subjects ──────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-10">
            <div className="mb-2 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Subjects
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Pick your path
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Deep-dive notes across multiple programming languages and
              technologies — each structured for progressive mastery.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject) => (
              <motion.div
                key={subject.slug}
                variants={fadeInUp}
                whileHover={subject.available ? "hover" : undefined}
                initial="rest"
              >
                <motion.div variants={subject.available ? cardHover : undefined}>
                  {subject.available ? (
                    <Link
                      href={`/notes/${subject.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/30"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${subject.bg}`}>
                          <subject.icon className={`h-5 w-5 ${subject.color}`} />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                      </div>
                      <h3 className="mb-1 font-semibold transition-colors group-hover:text-accent">
                        {subject.name}
                      </h3>
                      <div className="mt-auto flex items-center gap-2 pt-3">
                        <Badge variant="default" className="text-[10px]">
                          {subject.phases} phases
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {subject.notes} notes
                        </Badge>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex h-full flex-col rounded-xl border border-border/60 bg-surface/50 p-5 opacity-50">
                      <div className="mb-3 flex items-center justify-between">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${subject.bg}`}>
                          <subject.icon className={`h-5 w-5 ${subject.color}`} />
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          Soon
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{subject.name}</h3>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Code Decoration ──────────────────── */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="overflow-hidden rounded-2xl border border-border bg-surface"
        >
          {/* Terminal bar */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-danger/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
            </div>
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              devscribe.studio
            </span>
          </div>

          {/* Code preview */}
          <div className="p-6 font-mono text-sm leading-loose">
            <div className="text-muted-foreground">
              <span className="text-violet-400">const</span>{" "}
              <span className="text-sky-300">journey</span>{" "}
              <span className="text-muted-foreground">=</span>{" "}
              <span className="text-amber-400">{"{"}</span>
            </div>
            <div className="pl-6">
              <span className="text-emerald-400">subjects</span>
              <span className="text-muted-foreground">:</span>{" "}
              <span className="text-muted-foreground">[</span>
              <span className="text-orange-300">&quot;js&quot;</span>
              <span className="text-muted-foreground">,</span>{" "}
              <span className="text-orange-300">&quot;ts&quot;</span>
              <span className="text-muted-foreground">,</span>{" "}
              <span className="text-orange-300">&quot;py&quot;</span>
              <span className="text-muted-foreground">,</span>{" "}
              <span className="text-orange-300">&quot;...&quot;</span>
              <span className="text-muted-foreground">],</span>
            </div>
            <div className="pl-6">
              <span className="text-emerald-400">style</span>
              <span className="text-muted-foreground">:</span>{" "}
              <span className="text-orange-300">&quot;deep-dive&quot;</span>
              <span className="text-muted-foreground">,</span>
            </div>
            <div className="pl-6">
              <span className="text-emerald-400">start</span>
              <span className="text-muted-foreground">:</span>{" "}
              <span className="text-violet-400">() =&gt;</span>{" "}
              <span className="text-sky-300">explore</span>
              <span className="text-muted-foreground">(</span>
              <span className="text-orange-300">&quot;/notes&quot;</span>
              <span className="text-muted-foreground">)</span>
            </div>
            <div>
              <span className="text-amber-400">{"}"}</span>
              <span className="text-muted-foreground">;</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Content Types ────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-4 pb-28 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-10">
            <div className="mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Learning Formats
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Multiple ways to learn
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Different formats to match how you learn best — from structured
              reading to interactive exploration.
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map((type) => (
              <motion.div
                key={type.title}
                variants={fadeInUp}
                whileHover="hover"
                initial="rest"
              >
                <motion.div variants={cardHover}>
                  <div className="group flex h-full gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/30">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${type.bg}`}
                    >
                      <type.icon className={`h-5 w-5 ${type.color}`} />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold">{type.title}</h3>
                        {!type.available && (
                          <Badge variant="secondary" className="text-[10px]">
                            Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
