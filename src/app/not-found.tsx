import Link from "next/link";
import { BookOpen, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
      <div className="mb-6 font-mono text-6xl font-bold text-accent sm:text-8xl">
        404
      </div>
      <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try browsing our notes or heading back home.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link href="/notes">
          <Button variant="glow" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Browse Notes
          </Button>
        </Link>
      </div>
    </div>
  );
}
