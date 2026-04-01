import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

async function searchWithSerpApi(query: string, apiKey: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    // SerpApi - Real Google search results
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("engine", "google");
    url.searchParams.set("num", "10"); // Get top 10 results
    url.searchParams.set("location", "United States");
    url.searchParams.set("gl", "us");
    url.searchParams.set("hl", "en");

    const response = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error("SERP API error:", response.status, await response.text());
      return { organicResults: [], serpFeatures: {} };
    }

    const data = await response.json();
    
    // Extract organic results
    const organicResults = (data.organic_results || []).map((result: any) => ({
      position: result.position,
      title: result.title || "Untitled",
      url: result.link || "",
      domain: result.displayed_link || result.source || "unknown",
      description: result.snippet || "",
      date: result.date || null,
    }));

    // Extract SERP features
    const serpFeatures: Record<string, boolean> = {};
    if (data.answer_box) serpFeatures.featured_snippet = true;
    if (data.knowledge_graph) serpFeatures.knowledge_graph = true;
    if (data.related_questions) serpFeatures.people_also_ask = true;
    if (data.related_searches) serpFeatures.related_searches = true;
    if (data.local_results) serpFeatures.local_pack = true;
    if (data.inline_images) serpFeatures.image_pack = true;
    if (data.inline_videos) serpFeatures.video_results = true;
    if (data.shopping_results) serpFeatures.shopping_results = true;

    return { organicResults, serpFeatures };
  } catch (err) {
    console.error("SERP API timeout/error for query:", query, err);
    return { organicResults: [], serpFeatures: {} };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const niche = typeof body.niche === "string" ? body.niche.trim().slice(0, 200) : "";
    const keywords = Array.isArray(body.keywords) ? body.keywords.slice(0, 15).map((k: any) => String(k).slice(0, 100)) : [];

    if (!niche || !keywords.length) {
      return new Response(
        JSON.stringify({ error: "Niche and keywords are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SERP_API_KEY = Deno.env.get("SERP_API_KEY");
    if (!SERP_API_KEY) {
      return new Response(
        JSON.stringify({ error: "SERP API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze up to 10 keywords with optimized timeout handling
    const limitedKeywords = keywords.slice(0, 10);

    // Fetch SERP data in parallel using real Google results
    const serpEntries = await Promise.all(
      limitedKeywords.map(async (keyword: string) => {
        const query = `${keyword} ${niche}`.trim();
        const { organicResults, serpFeatures } = await searchWithSerpApi(query, SERP_API_KEY);

        return [keyword, { results: organicResults, features: serpFeatures }] as [string, any];
      })
    );
    const serpResults: Record<string, any> = Object.fromEntries(serpEntries);

    // Build concise SERP summary for AI with real Google results
    let serpSummary = "";
    for (const [keyword, data] of Object.entries(serpResults)) {
      const results = data.results || [];
      const features = data.features || {};
      const featureList = Object.keys(features).filter(k => features[k]).join(", ") || "none";
      
      serpSummary += `\n### "${keyword}" (${results.length} results, SERP features: ${featureList})\n`;
      if (results.length === 0) {
        serpSummary += "No results found.\n";
        continue;
      }
      results.slice(0, 10).forEach((r: any) => {
        serpSummary += `${r.position}. ${r.title} (${r.domain})\n   ${r.description?.slice(0, 200) || "No description"}\n`;
      });
    }

    const systemPrompt = `You are a senior SEO strategist. Analyze SERP data and return ONLY valid JSON. No markdown fences.`;

    const userPrompt = `Niche: "${niche}". Keywords: ${limitedKeywords.join(", ")}.

REAL GOOGLE SERP RESULTS (from SerpApi):
${serpSummary}

Analyze these REAL top-ranking Google results and return ONLY valid JSON. No markdown fences.

Return JSON:
{
  "keywords": [
    {
      "keyword": "string",
      "searchIntent": "informational|navigational|commercial|transactional",
      "intentConfidence": 85,
      "mentionCount": 5,
      "difficulty": "low|medium|high",
      "difficultyScore": 45,
      "serpFeatures": ["featured_snippet","people_also_ask"],
      "contentBenchmark": {
        "avgWordCount": 2500, "avgH2Count": 8, "avgImageCount": 5, "avgReadingTime": 10,
        "commonFormats": ["guide"], "structuralPatterns": ["string"]
      },
      "topCompetitors": [
        { "rank": 1, "title": "string", "source": "domain.com", "url": "string",
          "keywordDensity": "2.5%", "contentType": "blog|guide|video|product",
          "wordCount": 3000, "contentScore": 85,
          "strengths": ["string"], "weaknesses": ["string"] }
      ],
      "relatedKeywords": ["string"],
      "opportunity": "string",
      "quickWins": ["string"],
      "recommendedContentFormat": "string",
      "targetWordCount": 2500
    }
  ],
  "overallInsights": {
    "dominantContentType": "string",
    "dominantSearchIntent": "string",
    "avgWordCount": "2,500",
    "avgContentScore": 72,
    "contentGaps": ["string"],
    "commonTopics": ["string"],
    "serpFeatureSummary": { "featured_snippet": 3 },
    "topAuthorityDomains": ["string"],
    "recommendations": [
      { "priority": "high|medium|low", "action": "string", "impact": "string", "effort": "low|medium|high" }
    ],
    "contentStrategy": {
      "pillarContent": "string",
      "supportingContent": ["string"],
      "contentCalendarSuggestion": "string"
    }
  }
}

Base analysis on the real SERP data above. Include 2+ strengths/weaknesses per competitor.`;

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
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", aiResp.status, await aiResp.text());
      return new Response(JSON.stringify({ error: "Failed to get AI analysis" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content.slice(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse analysis results" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate analysis structure
    if (!analysis.keywords || !Array.isArray(analysis.keywords)) {
      console.error("Invalid analysis structure: missing keywords array");
      return new Response(JSON.stringify({ error: "Invalid analysis format returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each keyword has required fields
    analysis.keywords = analysis.keywords.map((kw: any) => ({
      keyword: kw.keyword || "Unknown",
      searchIntent: kw.searchIntent || "informational",
      intentConfidence: Math.min(100, Math.max(0, kw.intentConfidence || 50)),
      mentionCount: Math.max(0, kw.mentionCount || 0),
      difficulty: ["low", "medium", "high"].includes(kw.difficulty) ? kw.difficulty : "medium",
      difficultyScore: Math.min(100, Math.max(0, kw.difficultyScore || 50)),
      serpFeatures: Array.isArray(kw.serpFeatures) ? kw.serpFeatures : [],
      contentBenchmark: kw.contentBenchmark || {
        avgWordCount: 1500,
        avgH2Count: 5,
        avgImageCount: 3,
        avgReadingTime: 7,
        commonFormats: ["blog"],
        structuralPatterns: [],
      },
      topCompetitors: Array.isArray(kw.topCompetitors) 
        ? kw.topCompetitors.slice(0, 5).map((c: any, i: number) => ({
            rank: i + 1,
            title: c.title || "Untitled",
            source: c.source || "unknown",
            url: c.url || "",
            keywordDensity: c.keywordDensity || "N/A",
            contentType: c.contentType || "blog",
            wordCount: Math.max(0, c.wordCount || 0),
            contentScore: Math.min(100, Math.max(0, c.contentScore || 50)),
            strengths: Array.isArray(c.strengths) ? c.strengths : [],
            weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses : [],
          }))
        : [],
      relatedKeywords: Array.isArray(kw.relatedKeywords) ? kw.relatedKeywords : [],
      opportunity: kw.opportunity || "No specific opportunity identified",
      quickWins: Array.isArray(kw.quickWins) ? kw.quickWins : [],
      recommendedContentFormat: kw.recommendedContentFormat || "blog",
      targetWordCount: Math.max(0, kw.targetWordCount || 1500),
    }));

    // Validate overallInsights
    if (!analysis.overallInsights) {
      analysis.overallInsights = {};
    }
    
    analysis.overallInsights = {
      dominantContentType: analysis.overallInsights.dominantContentType || "blog",
      dominantSearchIntent: analysis.overallInsights.dominantSearchIntent || "informational",
      avgWordCount: analysis.overallInsights.avgWordCount || "1,500",
      avgContentScore: Math.min(100, Math.max(0, analysis.overallInsights.avgContentScore || 50)),
      contentGaps: Array.isArray(analysis.overallInsights.contentGaps) 
        ? analysis.overallInsights.contentGaps 
        : [],
      commonTopics: Array.isArray(analysis.overallInsights.commonTopics) 
        ? analysis.overallInsights.commonTopics 
        : [],
      serpFeatureSummary: analysis.overallInsights.serpFeatureSummary || {},
      topAuthorityDomains: Array.isArray(analysis.overallInsights.topAuthorityDomains) 
        ? analysis.overallInsights.topAuthorityDomains 
        : [],
      recommendations: Array.isArray(analysis.overallInsights.recommendations) 
        ? analysis.overallInsights.recommendations 
        : [],
      contentStrategy: analysis.overallInsights.contentStrategy || {
        pillarContent: "Not available",
        supportingContent: [],
        contentCalendarSuggestion: "Not available",
      },
    };

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("SEO analysis error:", error);
    return new Response(
      JSON.stringify({ error: "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
