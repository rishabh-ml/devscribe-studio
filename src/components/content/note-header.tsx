import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import type { NoteMetadata } from "@/lib/content";

interface NoteHeaderProps {
  note: NoteMetadata;
}

export function NoteHeader({ note }: NoteHeaderProps) {
  return (
    <div className="mb-8 border-b border-border pb-8">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge>Phase {note.phase}</Badge>
        {note.tags?.slice(0, 4).map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {note.title}
      </h1>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {note.readingTime}
        </span>
        {note.created && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(note.created).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
