interface KeywordAnalysis {
  keyword: string;
  searchIntent?: string;
  intentConfidence?: number;
  mentionCount: number;
  difficulty: "low" | "medium" | "high";
  difficultyScore?: number;
  serpFeatures?: string[];
  targetWordCount?: number;
  recommendedContentFormat?: string;
  opportunity: string;
  topCompetitors: Array<{
    rank: number;
    title: string;
    source: string;
    url?: string;
    keywordDensity: string;
    contentType: string;
    wordCount?: number;
    contentScore?: number;
  }>;
  relatedKeywords: string[];
}

interface Recommendation {
  priority?: string;
  action?: string;
  impact?: string;
  effort?: string;
}

interface AnalysisResult {
  keywords: KeywordAnalysis[];
  overallInsights: {
    dominantContentType: string;
    dominantSearchIntent?: string;
    avgWordCount: string;
    avgContentScore?: number;
    contentGaps?: string[];
    commonTopics: string[];
    recommendations?: (Recommendation | string)[];
  };
}

export function exportToCSV(result: AnalysisResult, niche: string): void {
  if (!result || !result.keywords.length) {
    console.error("No data to export");
    return;
  }

  // CSV Headers
  const headers = [
    "Keyword",
    "Search Intent",
    "Intent Confidence",
    "Difficulty",
    "Difficulty Score",
    "Target Word Count",
    "Recommended Format",
    "Top Competitor",
    "Competitor URL",
    "Competitor Word Count",
    "Competitor Score",
    "SERP Features",
    "Related Keywords",
    "Opportunity",
  ];

  // Build CSV rows
  const rows: string[][] = [headers];

  result.keywords.forEach((kw) => {
    const topComp = kw.topCompetitors[0];
    rows.push([
      kw.keyword,
      kw.searchIntent || "N/A",
      kw.intentConfidence?.toString() || "N/A",
      kw.difficulty,
      kw.difficultyScore?.toString() || "N/A",
      kw.targetWordCount?.toString() || "N/A",
      kw.recommendedContentFormat || "N/A",
      topComp?.title || "N/A",
      topComp?.url || "N/A",
      topComp?.wordCount?.toString() || "N/A",
      topComp?.contentScore?.toString() || "N/A",
      kw.serpFeatures?.join("; ") || "N/A",
      kw.relatedKeywords.join("; "),
      kw.opportunity,
    ]);
  });

  // Convert to CSV string
  const csvContent = rows.map((row) => 
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  // Download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `seo-analysis-${niche.replace(/\s+/g, "-")}-${Date.now()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCompetitorsToCSV(result: AnalysisResult, niche: string): void {
  if (!result || !result.keywords.length) {
    console.error("No data to export");
    return;
  }

  const headers = [
    "Keyword",
    "Rank",
    "Competitor Title",
    "Source Domain",
    "URL",
    "Content Type",
    "Word Count",
    "Content Score",
    "Keyword Density",
    "Strengths",
    "Weaknesses",
  ];

  const rows: string[][] = [headers];

  result.keywords.forEach((kw) => {
    kw.topCompetitors.forEach((comp) => {
      const competitorWithDetails = comp as typeof comp & { strengths?: string[]; weaknesses?: string[] };
      rows.push([
        kw.keyword,
        comp.rank.toString(),
        comp.title,
        comp.source,
        comp.url || "N/A",
        comp.contentType,
        comp.wordCount?.toString() || "N/A",
        comp.contentScore?.toString() || "N/A",
        comp.keywordDensity,
        competitorWithDetails.strengths?.join("; ") || "N/A",
        competitorWithDetails.weaknesses?.join("; ") || "N/A",
      ]);
    });
  });

  const csvContent = rows.map((row) => 
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `competitors-analysis-${niche.replace(/\s+/g, "-")}-${Date.now()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportRecommendationsToCSV(result: AnalysisResult, niche: string): void {
  if (!result || !result.overallInsights) {
    console.error("No data to export");
    return;
  }

  const headers = ["Priority", "Action", "Impact", "Effort"];
  const rows: string[][] = [headers];

  const recs = result.overallInsights.recommendations || [];
  
  recs.forEach((rec) => {
    if (typeof rec === "object") {
      rows.push([
        rec.priority || "N/A",
        rec.action || "N/A",
        rec.impact || "N/A",
        rec.effort || "N/A",
      ]);
    } else {
      rows.push(["N/A", rec.toString(), "N/A", "N/A"]);
    }
  });

  const csvContent = rows.map((row) => 
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `recommendations-${niche.replace(/\s+/g, "-")}-${Date.now()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
