"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Menu, X, Code2, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/notes", label: "Notes", icon: BookOpen },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Code2 className="h-4 w-4" />
          </div>
          <span className="text-lg tracking-tight">DevScribe</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-1.5",
                    isActive && "bg-muted text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border px-4 py-3 sm:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  isActive && "bg-muted text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
