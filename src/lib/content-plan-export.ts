/**
 * Export content plan as CSV or PDF.
 */

type ContentItem = {
  day: number;
  title: string;
  type: string;
  keyword: string;
  description: string;
  long_tail_keyword?: string;
};

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

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function exportPlanAsCSV(plan: ContentItem[], niche: string) {
  const headers = ["Day", "Title", "Type", "Keyword", "Long-Tail Keyword", "Description"];
  const rows = plan.map((item) => [
    String(item.day),
    escapeCsvField(item.title),
    escapeCsvField(item.type),
    escapeCsvField(item.keyword),
    escapeCsvField(item.long_tail_keyword || ""),
    escapeCsvField(item.description),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const slug = niche.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  downloadFile(csv, `content-plan-${slug}.csv`, "text/csv");
}

export function exportPlanAsPDF(plan: ContentItem[], niche: string) {
  const slug = niche.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);

  const rows = plan
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:600;color:#6366f1;">${item.day}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:500;">${esc(item.title)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
          <span style="background:#f3f4f6;padding:2px 8px;border-radius:999px;font-size:11px;text-transform:capitalize;">${esc(item.type)}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${esc(item.keyword)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${esc(item.long_tail_keyword || "—")}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;max-width:240px;">${esc(item.description)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Content Plan – ${esc(niche)}</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 40px; color: #1a1a1a; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 10px 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
  </style>
</head>
<body>
  <h1>30-Day Content Plan</h1>
  <p class="meta">Niche: ${esc(niche)} · ${plan.length} posts · Generated ${new Date().toLocaleDateString()}</p>
  <table>
    <thead>
      <tr>
        <th>Day</th><th>Title</th><th>Type</th><th>Keyword</th><th>Long-Tail</th><th>Description</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
