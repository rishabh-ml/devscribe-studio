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
    description: "Obsidian-style MDX notes organized by learning phases",
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

const phases = [
  { number: 1, title: "Language Foundations", topics: 8, weeks: "1–3" },
  { number: 2, title: "Control Flow & Data Structures", topics: 7, weeks: "4–6" },
  { number: 3, title: "Functions, Scope & Closures", topics: 8, weeks: "7–9" },
  { number: 4, title: "this, Prototypes & OOP", topics: 5, weeks: "10–11" },
  { number: 5, title: "Async JavaScript", topics: 5, weeks: "12–13" },
  { number: 6, title: "DOM, Events & Browser APIs", topics: 10, weeks: "14–17" },
  { number: 7, title: "Modules & Modern Features", topics: 6, weeks: "18–19" },
  { number: 8, title: "Advanced Patterns", topics: 5, weeks: "20–21" },
  { number: 9, title: "Testing & Performance", topics: 4, weeks: "22–23" },
  { number: 10, title: "TypeScript & Ecosystem", topics: 6, weeks: "24–26" },
];

const stats = [
  { label: "Phases", value: "10" },
  { label: "Topics", value: "64" },
  { label: "Notes", value: "85" },
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
              Learn JavaScript.{" "}
              <span className="gradient-text">Deeply.</span>
            </motion.h1>

            <motion.p
              variants={heroReveal}
              className="mb-10 max-w-2xl font-serif text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              A structured knowledge base covering 10 phases, 64 topics, and 200+
              concepts — organized for progressive mastery from fundamentals
              through engine internals and metaprogramming.
            </motion.p>

            <motion.div
              variants={heroReveal}
              className="mb-16 flex flex-wrap items-center justify-center gap-3"
            >
              <Link href="/notes">
                <Button variant="glow" size="lg" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Browse Notes
                </Button>
              </Link>
              <Link href="/notes/phase-1-language-foundations/01-phase-1-overview">
                <Button variant="outline" size="lg" className="gap-2">
                  Start Phase 1
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
              <span className="text-emerald-400">phases</span>
              <span className="text-muted-foreground">:</span>{" "}
              <span className="text-amber-300">10</span>
              <span className="text-muted-foreground">,</span>
            </div>
            <div className="pl-6">
              <span className="text-emerald-400">topics</span>
              <span className="text-muted-foreground">:</span>{" "}
              <span className="text-amber-300">64</span>
              <span className="text-muted-foreground">,</span>
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
      <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
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

      {/* ─── Phase Timeline ───────────────────── */}
      <section className="relative mx-auto max-w-6xl px-4 pb-28 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainerSlow}
        >
          <motion.div variants={fadeInUp} className="mb-10">
            <div className="mb-2 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                JavaScript Mastery
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              10 phases to mastery
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              From variable declarations to metaprogramming — a structured path through
              every corner of the language.
            </p>
          </motion.div>

          {/* Phase grid with connecting line */}
          <div className="relative">
            {/* Vertical connecting line (desktop) */}
            <div className="absolute left-[19px] top-4 hidden h-[calc(100%-32px)] w-px bg-gradient-to-b from-accent/40 via-accent/20 to-transparent lg:block" />

            <div className="space-y-3">
              {phases.map((phase, i) => (
                <motion.div key={phase.number} variants={fadeInUp}>
                  <Link
                    href={`/notes/phase-${phase.number}-${phase.title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")}`}
                    className="group block"
                  >
                    <div className="flex items-start gap-4 rounded-xl border border-transparent p-3 transition-all hover:border-border hover:bg-surface lg:gap-6">
                      {/* Phase number */}
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted font-mono text-sm font-bold text-muted-foreground transition-all group-hover:border-accent/50 group-hover:bg-accent/10 group-hover:text-accent group-hover:shadow-sm group-hover:shadow-accent-glow">
                        {String(phase.number).padStart(2, "0")}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-baseline gap-3">
                          <h3 className="font-semibold transition-colors group-hover:text-accent">
                            {phase.title}
                          </h3>
                          <span className="hidden text-xs text-muted-foreground sm:inline">
                            Weeks {phase.weeks}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {phase.topics} topics
                          </span>
                          {i === 0 && (
                            <Badge variant="success" className="text-[10px]">
                              Start here
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:text-accent group-hover:opacity-100" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
