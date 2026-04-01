import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

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
    const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 1000) : "";
    const keywords = typeof body.keywords === "string" ? body.keywords.trim().slice(0, 500) : "";
    const tone = typeof body.tone === "string" ? body.tone.trim().slice(0, 50) : "";

    if (!topic) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const systemPrompt = `You are an expert SEO blog writer. Write high-quality, engaging blog posts optimized for search engines.

When given a topic, generate a complete blog post with:
- An attention-grabbing title
- A compelling excerpt (1-2 sentences)
- Well-structured content with markdown formatting (headings, lists, bold text)
- Natural keyword integration
- At least 500 words

Respond in valid JSON format:
{
  "title": "Blog Post Title",
  "excerpt": "A short compelling excerpt...",
  "content": "Full markdown content...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const userPrompt = `Write a blog post about: ${topic}${keywords ? `\n\nTarget keywords: ${keywords}` : ""}${tone ? `\n\nTone: ${tone}` : ""}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to your workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "Failed to generate content" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonStr = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = {
        title: "Generated Blog Post",
        excerpt: "",
        content: rawContent,
        keywords: [],
      };
    }

    // === AI SELF-REVIEW PASS ===
    // A second, fast AI call reviews and corrects the generated blog post
    const reviewPrompt = `You are a strict QA editor for SEO blog posts. Review and correct the following blog post about "${topic}".

CHECK AND FIX:
1. Title must be compelling, SEO-optimized, and accurately reflect the content (50-70 chars ideal)
2. Excerpt must be a concise 1-2 sentence summary that hooks the reader
3. Content must be well-structured markdown with proper headings (H2, H3), lists, and bold text
4. Content must be at least 500 words and factually coherent
5. Keywords must be naturally integrated throughout (not stuffed)
6. No placeholder text, incomplete sentences, or abrupt endings
7. Logical flow: introduction → body sections → conclusion
8. Each section should provide genuine value, not filler
${keywords ? `9. Target keywords "${keywords}" should appear naturally in title, headings, and body` : ""}
${tone ? `10. Tone should consistently be "${tone}" throughout` : ""}

Return ONLY valid JSON with these fields: title, excerpt, content, keywords (array).
If everything is good, return unchanged. If issues found, fix them.
No markdown fences or explanation outside the JSON.`;

    try {
      const reviewResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            { role: "system", content: reviewPrompt },
            { role: "user", content: JSON.stringify(parsed) },
          ],
        }),
      });

      if (reviewResponse.ok) {
        const reviewData = await reviewResponse.json();
        const reviewRaw = reviewData.choices?.[0]?.message?.content || "";
        const reviewCleaned = reviewRaw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        try {
          const reviewed = JSON.parse(reviewCleaned);
          if (reviewed.title && reviewed.content) {
            parsed = reviewed;
            console.log("Blog post verified and corrected by review pass");
          }
        } catch {
          console.warn("Review pass returned invalid JSON, using original");
        }
      } else {
        console.warn("Review pass failed with status:", reviewResponse.status, "- using original post");
      }
    } catch (reviewErr) {
      console.warn("Review pass error, using original post:", reviewErr);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog error:", e);
    return new Response(JSON.stringify({ error: "Failed to generate blog post" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
