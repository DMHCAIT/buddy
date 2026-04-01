import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Sparkles,
  Pencil,
  Eye,
  Save,
  CalendarCheck,
  Download,
  Code,
  FileDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { exportAsMarkdown, exportAsHTML } from "@/lib/export-utils";

import { PageShell } from "@/components/PageShell";

const TodaysBlog = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [todayItem, setTodayItem] = useState<any>(null);
  const [existingPost, setExistingPost] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [alreadyPostedToday, setAlreadyPostedToday] = useState(false);
  const [tone, setTone] = useState("professional");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Allow access without login - demo mode available

  useEffect(() => {
    if (!user) return;
    loadTodaysData();
  }, [user]);

  const loadTodaysData = async () => {
    setLoading(true);
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [planRes, postsRes, profileRes] = await Promise.all([
        supabase
          .from("content_plans" as any)
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("blog_posts")
          .select("*")
          .eq("user_id", user!.id)
          .gte("created_at", todayStart.toISOString())
          .lte("created_at", todayEnd.toISOString()),
        supabase
          .from("profiles")
          .select("niche, keywords")
          .eq("user_id", user!.id)
          .single(),
      ]);

      if (postsRes.data && postsRes.data.length > 0) {
        setAlreadyPostedToday(true);
        const post = postsRes.data[0];
        setExistingPost(post);
        setTitle(post.title);
        setExcerpt(post.excerpt || "");
        setContent(post.content);
        setKeywords(post.keywords || []);
      }

      if (planRes.data) {
        const plan = planRes.data as any;
        const planCreatedAt = new Date(plan.created_at);
        const now = new Date();
        const diffTime = now.getTime() - planCreatedAt.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const todayDay = (diffDays % 30) + 1;

        const items = plan.items || [];
        const todayContent = items.find((item: any) => Number(item.day) === todayDay);
        setTodayItem(todayContent || null);
        if (plan.tone) setTone(plan.tone);
      }
    } catch (e) {
      console.error("Error loading today's data:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateBlog = async () => {
    if (!todayItem || !user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: {
          topic: todayItem.title,
          keywords: [todayItem.keyword, todayItem.long_tail_keyword].filter(Boolean).join(", "),
          tone,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setTitle(data.title || todayItem.title);
      setExcerpt(data.excerpt || "");
      setContent(data.content || "");
      setKeywords(data.keywords || [todayItem.keyword]);

      const { data: saved, error: saveError } = await supabase
        .from("blog_posts")
        .insert({
          user_id: user.id,
          title: data.title || todayItem.title,
          excerpt: data.excerpt || "",
          content: data.content || "",
          keywords: data.keywords || [todayItem.keyword],
          status: "draft",
        })
        .select()
        .single();

      if (saveError) throw saveError;
      setExistingPost(saved);
      setAlreadyPostedToday(true);
      toast({ title: "Blog generated!", description: "Your today's blog post has been created as a draft." });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!existingPost || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ title, excerpt, content, keywords, status })
        .eq("id", existingPost.id);

      if (error) throw error;
      setExistingPost({ ...existingPost, title, excerpt, content, keywords, status });
      toast({
        title: status === "published" ? "Published!" : "Saved!",
        description: status === "published" ? "Your blog post is now published." : "Draft saved.",
      });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const headerActions = existingPost ? (
    <>
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download size={16} /> Export
        </button>
        {showExportMenu && (
          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-10 min-w-[160px] py-1">
            <button
              onClick={() => { exportAsHTML(title, content, excerpt || undefined, keywords); setShowExportMenu(false); toast({ title: "Exported as HTML" }); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
            >
              <Code size={14} /> Export as HTML
            </button>
            <button
              onClick={() => { exportAsMarkdown(title, content, excerpt || undefined, keywords); setShowExportMenu(false); toast({ title: "Exported as Markdown" }); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
            >
              <FileDown size={14} /> Export as Markdown
            </button>
          </div>
        )}
      </div>
      <button
        onClick={() => handleSave("draft")}
        disabled={saving}
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <Save size={14} /> Save Draft
      </button>
      <button
        onClick={() => handleSave("published")}
        disabled={saving}
        className="bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-sm"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        Publish
      </button>
    </>
  ) : undefined;

  return (
    <PageShell wide showSignOut headerActions={headerActions}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center">
          <CalendarCheck size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Today's Blog</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>


      {/* No content plan */}
      {!todayItem && !existingPost && (
        <div className="card-elevated p-12 text-center">
          <CalendarCheck size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Content Plan Found</h2>
          <p className="text-muted-foreground mb-6">
            Generate a content plan first to get daily blog topics.
          </p>
          <button
            onClick={() => navigate("/content-plan")}
            className="btn-primary inline-flex px-6"
          >
            Go to Content Plan
          </button>
        </div>
      )}

      {/* Today's topic card */}
      {todayItem && !existingPost && (
        <div className="card-elevated p-8 space-y-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Today's Topic</p>
            <h2 className="text-2xl font-bold">{todayItem.title}</h2>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>{" "}
              <span className="font-medium capitalize">{todayItem.type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Keyword:</span>{" "}
              <span className="font-medium">{todayItem.keyword}</span>
            </div>
            {todayItem.long_tail_keyword && (
              <div>
                <span className="text-muted-foreground">Long-tail:</span>{" "}
                <span className="font-medium">{todayItem.long_tail_keyword}</span>
              </div>
            )}
          </div>
          {todayItem.description && (
            <p className="text-muted-foreground text-sm">{todayItem.description}</p>
          )}
          <button onClick={generateBlog} disabled={generating} className="w-full btn-primary">
            {generating ? (
              <><Loader2 size={18} className="animate-spin" /> Generating Blog Post...</>
            ) : (
              <><Sparkles size={18} /> Generate Today's Blog Post</>
            )}
          </button>
        </div>
      )}

      {/* Editor */}
      {existingPost && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(false)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !previewMode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                previewMode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye size={14} /> Preview
            </button>
            {existingPost.status && (
              <span className={`ml-auto text-xs font-medium px-3 py-1.5 rounded-full ${
                existingPost.status === "published"
                  ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                  : "bg-muted text-muted-foreground"
              }`}>
                {existingPost.status}
              </span>
            )}
          </div>

          {previewMode ? (
            <div className="card-elevated p-8">
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              {excerpt && <p className="text-muted-foreground text-lg mb-6 italic">{excerpt}</p>}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Excerpt</label>
                <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Content (Markdown)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="input-base font-mono text-sm resize-y"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default TodaysBlog;
