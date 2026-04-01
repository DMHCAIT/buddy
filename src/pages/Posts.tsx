import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, FileText, Clock, CheckCircle, Trash2, Loader2, Download, Code, FileDown,
  Calendar, Eye, Filter, Search, Globe
} from "lucide-react";
import { exportAsMarkdown, exportAsHTML } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";

import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content?: string;
  keywords?: string[] | null;
  status: string;
  category?: string;
  tags?: string[];
  scheduled_at?: string | null;
  published_at?: string | null;
  created_at: string;
}

type StatusFilter = "all" | "draft" | "review" | "scheduled" | "published";
type ExportMenuOpen = string | null;

const STATUS_META: Record<string, { label: string; icon: typeof Clock; colorClass: string }> = {
  draft: { label: "Draft", icon: Clock, colorClass: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" },
  review: { label: "In Review", icon: Eye, colorClass: "bg-accent text-accent-foreground" },
  scheduled: { label: "Scheduled", icon: Calendar, colorClass: "bg-primary/10 text-primary" },
  published: { label: "Published", icon: CheckCircle, colorClass: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
};

const Posts = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportMenu, setExportMenu] = useState<ExportMenuOpen>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Allow access without login - demo mode available

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt, content, keywords, status, category, tags, scheduled_at, published_at, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error) setPosts(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPosts(posts.filter((p) => p.id !== id));
      toast({ title: "Post deleted" });
    }
  };

  const handleExport = (post: BlogPost, format: "html" | "markdown") => {
    if (!post.content) {
      toast({ title: "No content", description: "This post has no content to export.", variant: "destructive" });
      return;
    }
    if (format === "html") {
      exportAsHTML(post.title, post.content, post.excerpt || undefined, post.keywords || undefined);
    } else {
      exportAsMarkdown(post.title, post.content, post.excerpt || undefined, post.keywords || undefined);
    }
    setExportMenu(null);
    toast({ title: `Exported as ${format.toUpperCase()}` });
  };

  const filteredPosts = posts.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusCounts = posts.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const headerActions = (
    <button
      onClick={() => navigate("/create-post")}
      className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-4 py-2.5 rounded-xl hover:brightness-110 transition-all font-medium shadow-sm"
    >
      <Plus size={16} /> New Post
    </button>
  );

  return (
    <PageShell headerActions={headerActions}>

      <h1 className="text-3xl font-bold mb-2">Content Manager</h1>
      <p className="text-muted-foreground mb-6">Manage your blog posts, track status, and publish across platforms.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(["draft", "review", "scheduled", "published"] as const).map((s) => {
          const meta = STATUS_META[s];
          const Icon = meta.icon;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={cn(
                "card-elevated p-4 text-left transition-all",
                statusFilter === s && "ring-2 ring-primary/30"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{meta.label}</span>
              </div>
              <p className="text-2xl font-bold">{statusCounts[s] || 0}</p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="input-base pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-muted-foreground" />
          {(["all", "draft", "review", "scheduled", "published"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {s === "all" ? "All" : STATUS_META[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {posts.length === 0 ? "No posts yet" : "No matching posts"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {posts.length === 0 ? "Create your first AI-generated blog post." : "Try adjusting your filters."}
          </p>
          {posts.length === 0 && (
            <button
              onClick={() => navigate("/create-post")}
              className="btn-primary inline-flex px-6"
            >
              <Plus size={18} /> Create Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const meta = STATUS_META[post.status] || STATUS_META.draft;
            const Icon = meta.icon;
            return (
              <div
                key={post.id}
                className="card-elevated p-5 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full", meta.colorClass)}>
                      <Icon size={12} />
                      {meta.label}
                    </span>
                    {post.category && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {post.category}
                      </span>
                    )}
                    {post.tags && post.tags.length > 0 && post.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs text-muted-foreground">#{tag}</span>
                    ))}
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    {post.scheduled_at && post.status === "scheduled" && (
                      <span className="text-xs text-primary flex items-center gap-1">
                        <Calendar size={11} />
                        Scheduled: {new Date(post.scheduled_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="relative">
                    <button
                      onClick={() => setExportMenu(exportMenu === post.id ? null : post.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50"
                      title="Export"
                    >
                      <Download size={16} />
                    </button>
                    {exportMenu === post.id && (
                      <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-10 min-w-[160px] py-1 overflow-hidden">
                        <button
                          onClick={() => handleExport(post, "html")}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <Code size={14} /> Export as HTML
                        </button>
                        <button
                          onClick={() => handleExport(post, "markdown")}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <FileDown size={14} /> Export as Markdown
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-muted/50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default Posts;
