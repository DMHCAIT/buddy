import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Input validation
    const body = await req.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url || url.length > 500) {
      return new Response(
        JSON.stringify({ error: "A valid URL is required (max 500 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SSRF protection
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "10.", "172.16.", "192.168.", "[::1]"];
    if (blockedHosts.some((h) => parsedUrl.hostname.includes(h))) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    // --- Step 1: Use Firecrawl for high-quality content extraction ---
    let pageContent = "";
    let metaTitle = "";
    let metaDescription = "";
    let headings: string[] = [];
    let links: string[] = [];
    let brandingInfo: any = null;

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    if (FIRECRAWL_API_KEY) {
      try {
        console.log("Using Firecrawl for content extraction:", normalizedUrl);

        // Scrape with multiple formats for comprehensive analysis
        const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: normalizedUrl,
            formats: ["markdown", "links", "branding"],
            onlyMainContent: false, // Get full page for meta analysis
            waitFor: 3000,
          }),
        });

        if (scrapeResp.ok) {
          const scrapeData = await scrapeResp.json();
          const d = scrapeData.data || scrapeData;

          pageContent = (d.markdown || "").slice(0, 8000);
          links = (d.links || []).slice(0, 50);
          metaTitle = d.metadata?.title || "";
          metaDescription = d.metadata?.description || "";

          if (d.branding) {
            brandingInfo = {
              logo: d.branding.logo,
              colorScheme: d.branding.colorScheme,
            };
          }

          // Extract headings from markdown
          const headingMatches = pageContent.match(/^#{1,3}\s+.+$/gm) || [];
          headings = headingMatches.slice(0, 20).map((h: string) => h.replace(/^#+\s+/, ""));

          console.log(`Firecrawl extracted: ${pageContent.length} chars, ${links.length} links, ${headings.length} headings`);
        } else {
          console.warn("Firecrawl failed, falling back to basic fetch:", scrapeResp.status);
        }
      } catch (e) {
        console.warn("Firecrawl error, falling back:", e);
      }
    }

    // Fallback to basic fetch if Firecrawl didn't work
    if (!pageContent) {
      try {
        const pageResp = await fetch(normalizedUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; BlitzNovaBot/1.0)" },
          signal: AbortSignal.timeout(8000),
        });
        const html = await pageResp.text();

        // Extract meta tags
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        metaTitle = titleMatch?.[1]?.trim() || "";
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        metaDescription = descMatch?.[1]?.trim() || "";

        // Extract headings
        const hMatches = html.match(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi) || [];
        headings = hMatches.slice(0, 20).map((h: string) => h.replace(/<[^>]+>/g, "").trim());

        pageContent = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 6000);
      } catch {
        // Will analyze URL only
      }
    }

    // --- Step 2: Industry-standard SEO analysis prompt ---
    const contextSections: string[] = [];
    contextSections.push(`Target URL: ${url}`);
    contextSections.push(`Domain: ${parsedUrl.hostname}`);

    if (metaTitle) contextSections.push(`Meta Title: ${metaTitle}`);
    if (metaDescription) contextSections.push(`Meta Description: ${metaDescription}`);
    if (headings.length > 0) contextSections.push(`Page Headings:\n${headings.map(h => `- ${h}`).join("\n")}`);
    if (links.length > 0) {
      const internalLinks = links.filter(l => {
        try { return new URL(l).hostname === parsedUrl.hostname; } catch { return false; }
      });
      const externalLinks = links.filter(l => {
        try { return new URL(l).hostname !== parsedUrl.hostname; } catch { return false; }
      });
      contextSections.push(`Internal links found: ${internalLinks.length}`);
      contextSections.push(`External links found: ${externalLinks.length}`);
      if (internalLinks.length > 0) {
        contextSections.push(`Sample internal link paths:\n${internalLinks.slice(0, 15).map(l => `- ${new URL(l).pathname}`).join("\n")}`);
      }
    }
    if (pageContent) contextSections.push(`Page Content:\n${pageContent}`);

    const systemPrompt = `You are a senior SEO strategist with 15+ years of experience in keyword research, competitive analysis, and content strategy. You follow methodologies from Ahrefs, SEMrush, and Moz.

Your analysis must follow these industry-standard practices:
- Keyword selection based on search intent mapping (informational, navigational, commercial, transactional)
- Keywords grouped by topic clusters (pillar + supporting keywords)
- Difficulty estimation based on keyword competitiveness signals
- Focus on keywords with realistic ranking potential for the given domain
- Long-tail keywords that target specific user queries with clear intent

Return ONLY valid JSON. No markdown fences, no explanations outside JSON.`;

    const userPrompt = `Perform a comprehensive SEO keyword analysis for this website:

${contextSections.join("\n\n")}

Analyze the website and return a JSON object with this exact structure:
{
  "niche": "Primary niche/industry (be specific, e.g. 'B2B SaaS Project Management' not just 'Technology')",
  "subNiches": ["2-4 related sub-niches or verticals"],
  "description": "2-3 sentence description of what this business does and who it serves",
  "keywords": [
    {
      "term": "keyword phrase",
      "intent": "informational|navigational|commercial|transactional",
      "difficulty": "low|medium|high",
      "priority": "high|medium|low",
      "cluster": "topic cluster name"
    }
  ],
  "longTailKeywords": [
    {
      "term": "long tail keyword phrase (4+ words)",
      "intent": "informational|navigational|commercial|transactional",
      "difficulty": "low|medium",
      "searchContext": "brief context of when someone would search this"
    }
  ],
  "topicClusters": [
    {
      "pillar": "Main pillar topic",
      "supporting": ["3-5 supporting subtopics"]
    }
  ],
  "competitorKeywordGaps": ["3-5 keyword opportunities competitors likely rank for but this site may not"]
}

Requirements:
- Provide 12-18 target keywords with diverse search intents
- Provide 8-12 long-tail keywords (4+ words each)
- Provide 3-5 topic clusters
- Keywords must be specific to this business, not generic industry terms
- Difficulty should reflect real competitiveness (most keywords for smaller sites should be low-medium)
- Priority should consider business impact and ranking feasibility`;

    const aiResp = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", aiResp.status);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(jsonStr);
    } catch {
      result = { niche: "Unknown", description: content, keywords: [], longTailKeywords: [], topicClusters: [], subNiches: [], competitorKeywordGaps: [] };
    }

    // Normalize: ensure backward compat (flat keyword arrays alongside enriched)
    const flatKeywords = Array.isArray(result.keywords)
      ? result.keywords.map((k: any) => (typeof k === "string" ? k : k.term))
      : [];
    const flatLongTail = Array.isArray(result.longTailKeywords)
      ? result.longTailKeywords.map((k: any) => (typeof k === "string" ? k : k.term))
      : [];

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...result,
        // Keep flat arrays for profile saving compatibility
        flatKeywords,
        flatLongTail,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-site error:", e);
    return new Response(
      JSON.stringify({ error: "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
