import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code2 className="h-4 w-4" />
          <span>DevScribe.studio</span>
        </div>
        <p className="text-sm text-muted-foreground">
          A learning notebook for developers
        </p>
      </div>
    </footer>
  );
}
