"use client";

import { useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { createRoot } from "react-dom/client";

function CopyBtn({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-muted hover:text-foreground group-hover/pre:opacity-100"
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export function CopyCodeInjector() {
  useEffect(() => {
    const pres = document.querySelectorAll("article pre");
    const roots: ReturnType<typeof createRoot>[] = [];

    pres.forEach((pre) => {
      if (pre.querySelector("[data-copy-btn]")) return;

      pre.classList.add("group/pre");
      (pre as HTMLElement).style.position = "relative";

      const code = pre.textContent || "";
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-copy-btn", "true");
      pre.appendChild(wrapper);

      const root = createRoot(wrapper);
      root.render(<CopyBtn code={code} />);
      roots.push(root);
    });

    return () => {
      roots.forEach((r) => r.unmount());
    };
  }, []);

  return null;
}
