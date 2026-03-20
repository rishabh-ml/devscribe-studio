"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  ArrowRight,
  FileText,
  Video,
  Brain,
  HelpCircle,
  Presentation,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const contentTypes = [
  {
    icon: FileText,
    title: "Structured Notes",
    description: "Obsidian-style MDX notes organized by learning phases",
    available: true,
  },
  {
    icon: Video,
    title: "Video Overviews",
    description: "AI-generated video lectures via NotebookLM",
    available: false,
  },
  {
    icon: Brain,
    title: "Mindmaps",
    description: "Interactive visual mindmaps for topic exploration",
    available: false,
  },
  {
    icon: HelpCircle,
    title: "Quizzes",
    description: "Self-assessment quizzes tied to learning topics",
    available: false,
  },
  {
    icon: Presentation,
    title: "Slides",
    description: "Slide decks for visual learners",
    available: false,
  },
  {
    icon: Route,
    title: "Learning Paths",
    description: "Curated sequences linking resources together",
    available: false,
  },
];

const phases = [
  { number: 1, title: "Language Foundations", topics: 8 },
  { number: 2, title: "Control Flow & Data Structures", topics: 7 },
  { number: 3, title: "Functions, Scope & Closures", topics: 8 },
  { number: 4, title: "this, Prototypes & OOP", topics: 5 },
  { number: 5, title: "Async JavaScript", topics: 5 },
  { number: 6, title: "DOM, Events & Browser APIs", topics: 10 },
  { number: 7, title: "Modules & Modern Features", topics: 6 },
  { number: 8, title: "Advanced Patterns", topics: 5 },
  { number: 9, title: "Testing & Performance", topics: 4 },
  { number: 10, title: "TypeScript & Ecosystem", topics: 6 },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <motion.section
        className="py-16 sm:py-24"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="max-w-3xl">
          <Badge className="mb-4">AI-Powered Learning Notebook</Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Learn JavaScript.{" "}
            <span className="text-accent">Deeply.</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            A structured knowledge base covering 10 phases, 60+ topics, and 200+
            concepts — organized for progressive mastery from fundamentals
            through engine internals and metaprogramming.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/notes">
              <Button size="lg" className="gap-2">
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
          </div>
        </motion.div>
      </motion.section>

      {/* Content Types */}
      <motion.section
        className="pb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeInUp}
          className="mb-2 text-2xl font-bold tracking-tight"
        >
          What&apos;s Inside
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mb-8 text-muted-foreground"
        >
          Multiple formats to match how you learn best.
        </motion.p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contentTypes.map((type) => (
            <motion.div key={type.title} variants={fadeInUp}>
              <Card className="h-full">
                <CardContent className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <type.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold">{type.title}</h3>
                      {!type.available && (
                        <Badge variant="secondary">Coming Soon</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* JavaScript Learning Path */}
      <motion.section
        className="pb-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeInUp}
          className="mb-8 flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <Code2 className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              JavaScript Mastery
            </h2>
            <p className="text-sm text-muted-foreground">
              10 phases &middot; 60+ topics &middot; 200+ concepts
            </p>
          </div>
        </motion.div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {phases.map((phase) => (
            <motion.div key={phase.number} variants={fadeInUp}>
              <Link
                href={`/notes/phase-${phase.number}-${phase.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                className="block"
              >
                <Card className="group h-full transition-colors hover:border-accent/50 hover:bg-accent/5">
                  <CardContent>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                      Phase {phase.number}
                    </span>
                    <h3 className="mb-2 text-sm font-semibold group-hover:text-accent">
                      {phase.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {phase.topics} topics
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
