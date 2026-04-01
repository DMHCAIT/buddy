/**
 * Export blog post content as downloadable files (HTML or Markdown).
 */

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function exportAsMarkdown(title: string, content: string, excerpt?: string, keywords?: string[]) {
  const parts: string[] = [];
  parts.push(`# ${title}\n`);
  if (excerpt) parts.push(`> ${excerpt}\n`);
  if (keywords?.length) parts.push(`**Keywords:** ${keywords.join(", ")}\n`);
  parts.push("---\n");
  parts.push(content);

  downloadFile(parts.join("\n"), `${slugify(title)}.md`, "text/markdown");
}

export function exportAsHTML(title: string, content: string, excerpt?: string, keywords?: string[]) {
  // Convert basic markdown to HTML (headings, bold, italic, links, lists, paragraphs)
  const bodyHtml = markdownToHtml(content);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${keywords?.length ? `<meta name="keywords" content="${escapeHtml(keywords.join(", "))}">` : ""}
  ${excerpt ? `<meta name="description" content="${escapeHtml(excerpt)}">` : ""}
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.7; color: #1a1a1a; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; }
    h3 { font-size: 1.25rem; margin-top: 1.5rem; }
    blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 1rem 0; }
    code { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
    pre { background: #f3f4f6; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    a { color: #2563eb; }
    img { max-width: 100%; border-radius: 8px; }
    .keywords { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0; }
    .keywords span { background: #f3f4f6; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem; color: #374151; }
  </style>
</head>
<body>
  <article>
    <h1>${escapeHtml(title)}</h1>
    ${excerpt ? `<blockquote>${escapeHtml(excerpt)}</blockquote>` : ""}
    ${keywords?.length ? `<div class="keywords">${keywords.map(k => `<span>${escapeHtml(k)}</span>`).join("")}</div>` : ""}
    <hr>
    ${bodyHtml}
  </article>
</body>
</html>`;

  downloadFile(html, `${slugify(title)}.html`, "text/html");
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => `<pre><code>${escapeHtml(code.trim())}</code></pre>`);

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold & italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Images & links
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Unordered lists
  html = html.replace(/^[*-] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Paragraphs (lines not already wrapped in tags)
  html = html.replace(/^(?!<[a-z])((?!^\s*$).+)$/gm, "<p>$1</p>");

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}
