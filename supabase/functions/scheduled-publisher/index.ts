import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all posts that should be published now
    const { data: scheduledPosts, error: fetchError } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${scheduledPosts?.length || 0} posts to publish`);

    const results = [];

    for (const post of scheduledPosts || []) {
      try {
        // Update post status to published
        const { error: updateError } = await supabaseAdmin
          .from("blog_posts")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
          })
          .eq("id", post.id);

        if (updateError) {
          throw updateError;
        }

        // If WordPress publishing is enabled, trigger it
        if (post.platform_wordpress) {
          try {
            // Get user's WordPress credentials
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("wp_url, wp_username, wp_app_password")
              .eq("user_id", post.user_id)
              .single();

            if (profile && profile.wp_url && profile.wp_username && profile.wp_app_password) {
              const wpApiUrl = `${profile.wp_url.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
              const authString = btoa(`${profile.wp_username}:${profile.wp_app_password}`);

              const wpResponse = await fetch(wpApiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${authString}`,
                },
                body: JSON.stringify({
                  title: post.title,
                  content: post.content,
                  excerpt: post.excerpt || '',
                  status: 'publish',
                }),
              });

              if (wpResponse.ok) {
                const wpData = await wpResponse.json();
                
                // Update platform status
                const platformStatus = post.platform_status || {};
                platformStatus.wordpress = {
                  published: true,
                  publishedAt: new Date().toISOString(),
                  wordpressId: wpData.id,
                  wordpressUrl: wpData.link,
                };

                await supabaseAdmin
                  .from("blog_posts")
                  .update({ platform_status: platformStatus })
                  .eq("id", post.id);

                // Log success
                await supabaseAdmin.from("publishing_logs").insert({
                  post_id: post.id,
                  platform: 'wordpress',
                  status: 'success',
                  message: `Auto-published via scheduler. WordPress Post ID: ${wpData.id}`,
                  response_data: wpData,
                });
              } else {
                const errorText = await wpResponse.text();
                // Log error
                await supabaseAdmin.from("publishing_logs").insert({
                  post_id: post.id,
                  platform: 'wordpress',
                  status: 'error',
                  message: `WordPress API error: ${wpResponse.status} - ${errorText}`,
                });
              }
            }
          } catch (wpError) {
            console.error(`WordPress publish failed for post ${post.id}:`, wpError);
            // Log error
            await supabaseAdmin.from("publishing_logs").insert({
              post_id: post.id,
              platform: 'wordpress',
              status: 'error',
              message: wpError.message,
            });
          }
        }

        results.push({
          postId: post.id,
          title: post.title,
          status: "success",
        });
      } catch (error) {
        console.error(`Failed to publish post ${post.id}:`, error);
        results.push({
          postId: post.id,
          title: post.title,
          status: "error",
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Scheduler error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
