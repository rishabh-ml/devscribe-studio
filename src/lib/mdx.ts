/**
 * Preprocesses Obsidian-flavored markdown for web rendering.
 * - Converts [[wiki-links]] to standard markdown links
 * - Converts > [!type] callouts to HTML callout blocks
 */

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function preprocessMarkdown(content: string): string {
  let result = content;

  // Convert [[wiki-links]] to markdown links
  // [[02 - Variables and Declarations]] → [Variables and Declarations](/notes/...)
  result = result.replace(/\[\[([^\]]+)\]\]/g, (_match, linkText: string) => {
    const slug = slugify(linkText);
    // Just use the display text as a plain text reference for now
    // since cross-note linking requires knowing the phase
    const displayText = linkText.replace(/^\d+\s*-\s*/, "").trim();
    return `**${displayText}**`;
  });

  // Convert Obsidian callouts: > [!type] Title\n> content
  // to HTML callout divs
  result = processCallouts(result);

  return result;
}

function processCallouts(content: string): string {
  const lines = content.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const calloutMatch = lines[i].match(
      /^>\s*\[!(info|tip|warning|quote|danger|note|example|abstract|success|question|failure|bug)\]\s*(.*)/i
    );

    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase();
      const title = calloutMatch[2].trim();

      // Map Obsidian types to our callout types
      const typeMap: Record<string, string> = {
        info: "info",
        note: "info",
        abstract: "info",
        tip: "tip",
        success: "tip",
        example: "tip",
        question: "info",
        warning: "warning",
        danger: "warning",
        failure: "warning",
        bug: "warning",
        quote: "quote",
      };
      const cssType = typeMap[type] || "info";

      const iconMap: Record<string, string> = {
        info: "ℹ️",
        tip: "💡",
        warning: "⚠️",
        quote: "💬",
      };
      const icon = iconMap[cssType] || "ℹ️";

      // Collect callout body lines
      const bodyLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].startsWith(">")) {
        const bodyLine = lines[i].replace(/^>\s?/, "");
        bodyLines.push(bodyLine);
        i++;
      }

      const displayTitle = title || type.charAt(0).toUpperCase() + type.slice(1);
      const body = bodyLines.join("\n").trim();

      output.push(`<div class="callout callout-${cssType}">`);
      output.push(
        `<div class="callout-title">${icon} ${displayTitle}</div>`
      );
      if (body) {
        output.push(`<div class="callout-body">\n\n${body}\n\n</div>`);
      }
      output.push(`</div>`);
      output.push("");
    } else {
      output.push(lines[i]);
      i++;
    }
  }

  return output.join("\n");
}
