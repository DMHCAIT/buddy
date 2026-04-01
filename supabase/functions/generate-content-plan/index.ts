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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Input validation
    const body = await req.json();
    const niche = typeof body.niche === "string" ? body.niche.trim().slice(0, 200) : "";
    const keywords = Array.isArray(body.keywords) ? body.keywords.slice(0, 50).map((k: any) => String(k).slice(0, 100)) : [];
    const longTailKeywords = Array.isArray(body.longTailKeywords) ? body.longTailKeywords.slice(0, 50).map((k: any) => String(k).slice(0, 200)) : [];
    const days = typeof body.days === "number" && body.days >= 1 && body.days <= 365 ? Math.floor(body.days) : 30;
    const tone = typeof body.tone === "string" ? body.tone.trim().slice(0, 50) : "professional";
    const orgGoals = typeof body.orgGoals === "string" ? body.orgGoals.trim().slice(0, 1000) : "";
    const orgVision = typeof body.orgVision === "string" ? body.orgVision.trim().slice(0, 1000) : "";

    if (!niche) {
      return new Response(JSON.stringify({ error: "Niche is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const keywordList = keywords.join(", ");
    const longTailList = longTailKeywords.join(", ");

    // Build enriched SERP context from competitive insights
    let serpContext = "";
    const serpInsights = body.serpInsights;
    if (serpInsights?.keywords?.length) {
      serpContext = "\n\n=== SERP COMPETITIVE INTELLIGENCE ===\n";
      serpContext += "Use this real competitor data to create content that fills gaps and outperforms existing results.\n\n";

      for (const kw of serpInsights.keywords.slice(0, 10)) {
        serpContext += `## Keyword: "${String(kw.keyword).slice(0, 100)}"\n`;
        serpContext += `- Search Intent: ${kw.searchIntent || "unknown"} (confidence: ${kw.intentConfidence || "N/A"}%)\n`;
        serpContext += `- Difficulty: ${kw.difficulty || "unknown"} (score: ${kw.difficultyScore || "N/A"}/100)\n`;
        serpContext += `- Opportunity: ${String(kw.opportunity || "").slice(0, 300)}\n`;
        
        if (kw.recommendedContentFormat) {
          serpContext += `- Recommended Format: ${kw.recommendedContentFormat}\n`;
        }
        if (kw.targetWordCount) {
          serpContext += `- Target Word Count: ${kw.targetWordCount}\n`;
        }
        if (kw.contentBenchmark) {
          const cb = kw.contentBenchmark;
          serpContext += `- Content Benchmark: avg ${cb.avgWordCount} words, ${cb.avgH2Count} H2s, ${cb.avgImageCount} images\n`;
          if (cb.commonFormats?.length) {
            serpContext += `- Winning Formats: ${cb.commonFormats.join(", ")}\n`;
          }
          if (cb.structuralPatterns?.length) {
            serpContext += `- Structural Patterns: ${cb.structuralPatterns.slice(0, 3).join("; ")}\n`;
          }
        }
        if (kw.serpFeatures?.length) {
          serpContext += `- SERP Features Present: ${kw.serpFeatures.join(", ")}\n`;
          serpContext += `  → Create content optimized for these features (e.g., FAQ sections for PAA, concise answers for featured snippets)\n`;
        }
        if (kw.quickWins?.length) {
          serpContext += `- Quick Win Tactics:\n`;
          kw.quickWins.slice(0, 3).forEach((qw: string) => {
            serpContext += `  • ${String(qw).slice(0, 200)}\n`;
          });
        }
        if (kw.relatedKeywords?.length) {
          serpContext += `- Related Keywords: ${kw.relatedKeywords.slice(0, 8).join(", ")}\n`;
        }
        serpContext += "\n";
      }

      if (serpInsights.overallInsights) {
        const oi = serpInsights.overallInsights;
        serpContext += "## Overall Market Insights\n";
        serpContext += `- Dominant Content Type: ${String(oi.dominantContentType || "").slice(0, 50)}\n`;
        serpContext += `- Dominant Search Intent: ${String(oi.dominantSearchIntent || "").slice(0, 50)}\n`;
        serpContext += `- Avg Word Count: ${oi.avgWordCount}\n`;
        serpContext += `- Avg Content Score: ${oi.avgContentScore || "N/A"}/100\n`;
        
        if (oi.contentGaps?.length) {
          serpContext += `\n### Content Gaps to Exploit:\n`;
          oi.contentGaps.slice(0, 5).forEach((gap: string) => {
            serpContext += `  • ${String(gap).slice(0, 200)}\n`;
          });
        }
        if (oi.commonTopics?.length) {
          serpContext += `- Common Topics: ${oi.commonTopics.slice(0, 10).join(", ")}\n`;
        }
        if (oi.topAuthorityDomains?.length) {
          serpContext += `- Top Authority Domains: ${oi.topAuthorityDomains.slice(0, 5).join(", ")}\n`;
        }

        // Include prioritized recommendations
        if (oi.recommendations?.length) {
          serpContext += `\n### Strategic Recommendations:\n`;
          const recs = oi.recommendations.slice(0, 5);
          recs.forEach((rec: any) => {
            if (typeof rec === "string") {
              serpContext += `  • ${rec}\n`;
            } else {
              serpContext += `  • [${rec.priority?.toUpperCase() || "MED"}] ${rec.action} → Impact: ${rec.impact} (Effort: ${rec.effort})\n`;
            }
          });
        }

        // Include content strategy
        if (oi.contentStrategy) {
          const cs = oi.contentStrategy;
          serpContext += `\n### Content Strategy Blueprint:\n`;
          if (cs.pillarContent) serpContext += `- Pillar Content: ${cs.pillarContent}\n`;
          if (cs.supportingContent?.length) {
            serpContext += `- Supporting Content Ideas: ${cs.supportingContent.slice(0, 5).join("; ")}\n`;
          }
          if (cs.contentCalendarSuggestion) {
            serpContext += `- Calendar Strategy: ${cs.contentCalendarSuggestion}\n`;
          }
        }
      }
    }

    // Build organization context
    let orgContext = "";
    if (orgGoals || orgVision) {
      orgContext = "\n\n=== ORGANIZATION CONTEXT ===\nAlign all content with these strategic directions:\n";
      if (orgGoals) orgContext += `- Goals: ${orgGoals}\n`;
      if (orgVision) orgContext += `- Vision: ${orgVision}\n`;
    }

    const systemPrompt = `You are an expert SEO content strategist. Generate a ${days}-day content plan as a JSON array.

Each item must have:
- "day": number (1 to ${days})
- "title": a compelling, SEO-optimized blog post title
- "type": one of "blog", "listicle", "how-to", "case-study", "opinion"
- "keyword": the primary keyword to target
- "long_tail_keyword": a relevant long-tail keyword phrase (3-6 words)${longTailList ? ", preferring from the provided list" : ""}
- "description": a 1-2 sentence summary with the content angle and unique value proposition

IMPORTANT RULES:
${serpContext ? `- Use the SERP competitive intelligence to inform content angles, formats, and gaps to exploit
- Prioritize content that fills identified content gaps
- Match recommended content formats from SERP analysis
- Target SERP features (featured snippets, PAA) where identified
- Apply quick-win tactics from the analysis` : ""}
- Ensure variety in content types and distribute keywords evenly
- Each post should target a unique long-tail keyword
- Sequence content logically (foundational → advanced)
- Include pillar content pieces early in the plan

Return ONLY a valid JSON array, no markdown fences.`;

    const userPrompt = `Create a ${days}-day content plan for the "${niche}" niche.

Primary keywords: ${keywordList}
${longTailList ? `Long-tail keywords: ${longTailList}` : ""}
Tone: ${tone}${orgContext}${serpContext}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let plan;
    try {
      plan = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      plan = match ? JSON.parse(match[0]) : [];
    }

    // === AI SELF-REVIEW PASS ===
    // A second, fast AI call reviews and corrects the generated plan
    const reviewPrompt = `You are a strict QA reviewer for SEO content plans. Review and correct the following ${days}-day content plan for the "${niche}" niche.

CHECK AND FIX:
1. Every item MUST have all required fields: day (number 1-${days}), title (string), type (one of: blog, listicle, how-to, case-study, opinion), keyword (string), long_tail_keyword (string, 3-6 words), description (string, 1-2 sentences)
2. Days must be sequential 1 to ${days} with no gaps or duplicates
3. Titles must be unique and SEO-optimized (no generic/vague titles)
4. Keywords must be relevant to the niche "${niche}" and from this list when possible: ${keywordList}
5. Long-tail keywords must be 3-6 words and unique across the plan
6. Content types should be varied (not all the same type)
7. Descriptions must clearly state the content angle and value proposition
8. Content should progress logically (foundational → advanced)

If everything is correct, return the plan unchanged. If issues are found, fix them and return the corrected plan.
Return ONLY a valid JSON array, no markdown fences or explanation.`;

    try {
      const reviewResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: reviewPrompt },
            { role: "user", content: JSON.stringify(plan) },
          ],
        }),
      });

      if (reviewResponse.ok) {
        const reviewData = await reviewResponse.json();
        const reviewRaw = reviewData.choices?.[0]?.message?.content || "";
        const reviewCleaned = reviewRaw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        try {
          const reviewedPlan = JSON.parse(reviewCleaned);
          if (Array.isArray(reviewedPlan) && reviewedPlan.length > 0) {
            plan = reviewedPlan;
            console.log("Content plan verified and corrected by review pass");
          }
        } catch {
          const reviewMatch = reviewCleaned.match(/\[[\s\S]*\]/);
          if (reviewMatch) {
            const reviewedPlan = JSON.parse(reviewMatch[0]);
            if (Array.isArray(reviewedPlan) && reviewedPlan.length > 0) {
              plan = reviewedPlan;
              console.log("Content plan verified and corrected by review pass (extracted)");
            }
          }
        }
      } else {
        console.warn("Review pass failed with status:", reviewResponse.status, "- using original plan");
      }
    } catch (reviewErr) {
      console.warn("Review pass error, using original plan:", reviewErr);
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content-plan error:", e);
    return new Response(JSON.stringify({ error: "Failed to generate content plan" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
