import type { MetadataRoute } from "next";
import { getAllNotes, getPhases } from "@/lib/content";
import { getAvailableSubjects } from "@/lib/subjects";

const BASE_URL = "https://devscribe.studio";

export default function sitemap(): MetadataRoute.Sitemap {
  const subjects = getAvailableSubjects();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/notes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const subjectRoutes: MetadataRoute.Sitemap = subjects.map((s) => ({
    url: `${BASE_URL}/notes/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const phaseRoutes: MetadataRoute.Sitemap = subjects.flatMap((s) =>
    getPhases(s.slug).map((phase) => ({
      url: `${BASE_URL}/notes/${s.slug}/${phase.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))
  );

  const noteRoutes: MetadataRoute.Sitemap = subjects.flatMap((s) =>
    getAllNotes(s.slug).map((note) => ({
      url: `${BASE_URL}/notes/${s.slug}/${note.phaseSlug}/${note.slug}`,
      lastModified: note.created ? new Date(note.created) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...staticRoutes, ...subjectRoutes, ...phaseRoutes, ...noteRoutes];
}
