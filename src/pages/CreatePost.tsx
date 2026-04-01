import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { PageShell } from "@/components/PageShell";
import { ContentEditor } from "@/components/cms/ContentEditor";
import { PublishPanel, PostStatus } from "@/components/cms/PublishPanel";
import { TemplateSelector } from "@/components/TemplateSelector";
import { ContentTemplate } from "@/lib/templates";

const CreatePost = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("professional");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [postKeywords, setPostKeywords] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"prompt" | "edit">("prompt");
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);

  // CMS fields
  const [status, setStatus] = useState<PostStatus>("draft");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [platformWordpress, setPlatformWordpress] = useState(false);
  const [platformMedium, setPlatformMedium] = useState(false);

  // Allow access without login - demo mode available
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("niche, keywords")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.keywords?.length) setKeywords(data.keywords.join(", "));
        if (data?.niche && !topic) setTopic(`Write about ${data.niche}`);
      });
  }, [user]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Enter a topic", description: "Please describe what you want to write about.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      // Include template information in the generation request
      const generationBody: any = { topic, keywords, tone };
      if (selectedTemplate) {
        generationBody.template = {
          name: selectedTemplate.name,
          structure: selectedTemplate.structure,
          promptTemplate: selectedTemplate.promptTemplate,
        };
      }

      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: generationBody,
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setTitle(data.title || "");
      setExcerpt(data.excerpt || "");
      setContent(data.content || "");
      setPostKeywords(data.keywords || []);
      setSeoTitle((data.title || "").slice(0, 60));
      setSeoDescription((data.excerpt || "").slice(0, 160));
      setStep("edit");
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  const handleSave = async (saveStatus: PostStatus) => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Missing content", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const postData = {
      user_id: user!.id,
      title,
      content,
      excerpt,
      keywords: postKeywords,
      status: saveStatus,
      category,
      tags,
      seo_title: seoTitle,
      seo_description: seoDescription,
      scheduled_at: scheduledAt?.toISOString() || null,
      published_at: saveStatus === "published" ? new Date().toISOString() : null,
      platform_wordpress: platformWordpress,
      platform_medium: platformMedium,
      platform_status: {},
    };
    const { error } = await supabase.from("blog_posts").insert([postData]);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      const messages: Record<string, string> = {
        draft: "Draft saved",
        review: "Sent for review",
        scheduled: `Scheduled for ${scheduledAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(scheduledAt) : "later"}`,
        published: "Post published!",
      };
      toast({ title: messages[saveStatus] || "Saved" });
      navigate("/posts");
    }
    setSaving(false);
  };

  return (
    <PageShell
      backTo={step === "edit" ? undefined : "/"}
      backLabel={step === "edit" ? "Back to prompt" : "Back to dashboard"}
      wide
    >
      {step === "prompt" ? (
        <>
          <h1 className="text-3xl font-bold mb-2">Create a Blog Post</h1>
          <p className="text-muted-foreground mb-8">Describe your topic and let AI generate SEO-optimized content for you.</p>

          <div className="card-elevated p-8 space-y-8">
            {/* Template Selector Section */}
            <div className="pb-6 border-b">
              <TemplateSelector 
                onSelectTemplate={setSelectedTemplate}
                selectedTemplateId={selectedTemplate?.id}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Topic *</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 10 tips for improving website load speed in 2026"
                rows={3}
                className="input-base resize-none"
              />
              {selectedTemplate && (
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Using template: <span className="font-medium">{selectedTemplate.name}</span> ({selectedTemplate.structure.length} sections, ~{selectedTemplate.estimatedWords} words)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Keywords (optional)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., website speed, performance optimization, Core Web Vitals"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tone</label>
              <div className="flex flex-wrap gap-2">
                {["professional", "casual", "technical", "friendly"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      tone === t
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating} className="w-full btn-primary">
              {generating ? (
                <><Loader2 size={18} className="animate-spin" /> Generating your blog post...</>
              ) : (
                <><Sparkles size={18} /> Generate Blog Post</>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main editor */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-base text-xl font-bold"
                placeholder="Post title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="input-base resize-none text-sm"
                placeholder="Brief summary of the post..."
              />
            </div>

            {postKeywords.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {postKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 text-primary rounded-full text-xs font-medium"
                    >
                      {kw}
                      <button 
                        onClick={() => setPostKeywords(postKeywords.filter((_, j) => j !== i))} 
                        className="hover:text-destructive"
                        title="Remove keyword"
                        aria-label={`Remove ${kw}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <ContentEditor content={content} onChange={setContent} />
            </div>
          </div>

          {/* Sidebar publish panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PublishPanel
              status={status}
              onStatusChange={setStatus}
              scheduledAt={scheduledAt}
              onScheduledAtChange={setScheduledAt}
              platformWordpress={platformWordpress}
              onPlatformWordpressChange={setPlatformWordpress}
              platformMedium={platformMedium}
              onPlatformMediumChange={setPlatformMedium}
              onSave={handleSave}
              saving={saving}
              category={category}
              onCategoryChange={setCategory}
              tags={tags}
              onTagsChange={setTags}
              seoTitle={seoTitle}
              onSeoTitleChange={setSeoTitle}
              seoDescription={seoDescription}
              onSeoDescriptionChange={setSeoDescription}
            />
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default CreatePost;
