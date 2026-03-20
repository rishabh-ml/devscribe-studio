import type { MetadataRoute } from "next";
import { getAllNotes, getPhases } from "@/lib/content";

const BASE_URL = "https://devscribe.studio";

export default function sitemap(): MetadataRoute.Sitemap {
  const notes = getAllNotes();
  const phases = getPhases();

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

  const phaseRoutes: MetadataRoute.Sitemap = phases.map((phase) => ({
    url: `${BASE_URL}/notes/${phase.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const noteRoutes: MetadataRoute.Sitemap = notes.map((note) => ({
    url: `${BASE_URL}/notes/${note.phaseSlug}/${note.slug}`,
    lastModified: note.created ? new Date(note.created) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...phaseRoutes, ...noteRoutes];
}
