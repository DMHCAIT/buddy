import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  ArrowLeft,
  Loader2,
  BarChart3,
  Lightbulb,
  Globe,
  Sparkles,
  Target,
  Zap,
  FileText,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Layers,
  History,
  Download,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { exportToCSV, exportCompetitorsToCSV, exportRecommendationsToCSV } from "@/lib/seo-analysis-export";
import { DEMO_SEO_ANALYSIS } from "@/lib/demo-data";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

// --- Types ---
interface Competitor {
  rank: number;
  title: string;
  source: string;
  url?: string;
  keywordDensity: string;
  contentType: string;
  wordCount?: number;
  contentScore?: number;
  strengths?: string[];
  weaknesses?: string[];
}

interface ContentBenchmark {
  avgWordCount: number;
  avgH2Count: number;
  avgImageCount: number;
  avgReadingTime: number;
  commonFormats: string[];
  structuralPatterns: string[];
}

interface KeywordAnalysis {
  keyword: string;
  searchIntent?: string;
  intentConfidence?: number;
  mentionCount: number;
  difficulty: "low" | "medium" | "high";
  difficultyScore?: number;
  serpFeatures?: string[];
  contentBenchmark?: ContentBenchmark;
  topCompetitors: Competitor[];
  relatedKeywords: string[];
  opportunity: string;
  quickWins?: string[];
  recommendedContentFormat?: string;
  targetWordCount?: number;
}

interface Recommendation {
  priority: string;
  action: string;
  impact: string;
  effort: string;
}

interface ContentStrategy {
  pillarContent: string;
  supportingContent: string[];
  contentCalendarSuggestion: string;
}

interface OverallInsights {
  dominantContentType: string;
  dominantSearchIntent?: string;
  avgWordCount: string;
  avgContentScore?: number;
  contentGaps?: string[];
  commonTopics: string[];
  serpFeatureSummary?: Record<string, number>;
  topAuthorityDomains?: string[];
  recommendations: Recommendation[] | string[];
  contentStrategy?: ContentStrategy;
}

interface AnalysisResult {
  keywords: KeywordAnalysis[];
  overallInsights: OverallInsights;
}

// --- Constants ---
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(340, 65%, 50%)",
  "hsl(160, 55%, 40%)",
  "hsl(30, 70%, 50%)",
];

const difficultyColor: Record<string, string> = {
  low: "bg-green-500/10 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/10 text-red-400 border-red-500/30",
};

const intentConfig: Record<string, { color: string; icon: string }> = {
  informational: { color: "bg-chart-1/15 text-chart-1 border-chart-1/30", icon: "📖" },
  navigational: { color: "bg-chart-2/15 text-chart-2 border-chart-2/30", icon: "🧭" },
  commercial: { color: "bg-chart-3/15 text-chart-3 border-chart-3/30", icon: "🛒" },
  transactional: { color: "bg-chart-4/15 text-chart-4 border-chart-4/30", icon: "💳" },
};

const contentTypeColor: Record<string, string> = {
  blog: "bg-blue-500/10 text-blue-400",
  guide: "bg-purple-500/10 text-purple-400",
  video: "bg-pink-500/10 text-pink-400",
  product: "bg-orange-500/10 text-orange-400",
  forum: "bg-teal-500/10 text-teal-400",
  news: "bg-cyan-500/10 text-cyan-400",
  tool: "bg-emerald-500/10 text-emerald-400",
  comparison: "bg-amber-500/10 text-amber-400",
};

const serpFeatureLabels: Record<string, string> = {
  featured_snippet: "Featured Snippet",
  people_also_ask: "People Also Ask",
  video_carousel: "Video Carousel",
  knowledge_panel: "Knowledge Panel",
  image_pack: "Image Pack",
  local_pack: "Local Pack",
};

const priorityConfig: Record<string, { color: string; icon: typeof Zap }> = {
  high: { color: "border-destructive/30 bg-destructive/5", icon: Zap },
  medium: { color: "border-chart-3/30 bg-chart-3/5", icon: Target },
  low: { color: "border-muted bg-muted/30", icon: Lightbulb },
};

const effortColors: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-red-400",
};

const SeoAnalysis = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [niche, setNiche] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0, status: "" });
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Allow access without login - just show limited features
  useEffect(() => {
    // Try to load from session storage first (for non-logged-in users)
    const storedAnalysis = sessionStorage.getItem('siteAnalysis');
    if (storedAnalysis) {
      try {
        const data = JSON.parse(storedAnalysis);
        if (data.niche) setNiche(data.niche);
        if (data.keywords?.length || data.flatKeywords?.length) {
          const allKeywords = [...(data.flatKeywords || []), ...(data.keywords || [])]
            .map((k: any) => typeof k === 'string' ? k : k.term)
            .filter(Boolean);
          setKeywords(allKeywords);
        }
      } catch (e) {
        console.error('Failed to parse stored analysis:', e);
      }
    }
    
    // If user is logged in, load from database (overrides session storage)
    if (user) {
      supabase
        .from("profiles")
        .select("niche, keywords")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.niche) setNiche(data.niche);
          if (data?.keywords?.length) setKeywords(data.keywords);
          setProfileLoading(false);
        });
      
      // Load analysis history
      supabase
        .from("serp_analyses" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data }) => {
          if (data) setAnalysisHistory(data);
        });
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!niche || !keywords.length) {
      toast({ title: "Missing data", description: "Please enter a niche and keywords to analyze.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    setResult(null);
    setSelectedKeyword(null);
    setAnalysisProgress({ current: 0, total: keywords.length, status: "Initializing..." });
    
    try {
      // If not logged in or backend not available, use demo data
      if (!user) {
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAnalysisProgress({ current: keywords.length, total: keywords.length, status: "Analysis complete!" });
        
        // Use demo data
        setResult(DEMO_SEO_ANALYSIS);
        if (DEMO_SEO_ANALYSIS?.keywords?.length) {
          setSelectedKeyword(DEMO_SEO_ANALYSIS.keywords[0].keyword);
        }
        toast({ 
          title: "Demo Analysis Complete", 
          description: `Showing demo results for ${DEMO_SEO_ANALYSIS.keywords.length} keywords. Login to save results and get real data.` 
        });
        return;
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev.current < prev.total) {
            const newCurrent = Math.min(prev.current + 1, prev.total);
            return {
              current: newCurrent,
              total: prev.total,
              status: newCurrent === prev.total 
                ? "Finalizing analysis..." 
                : `Analyzing keyword ${newCurrent} of ${prev.total}...`
            };
          }
          return prev;
        });
      }, 3000); // Update every 3 seconds

      const { data, error } = await supabase.functions.invoke("seo-analysis", {
        body: { niche, keywords },
      });
      
      clearInterval(progressInterval);
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      if (data?.keywords?.length) setSelectedKeyword(data.keywords[0].keyword);

      if (user) {
        const { data: newAnalysis } = await supabase.from("serp_analyses" as any).insert({
          user_id: user.id,
          niche,
          keywords,
          analysis: data,
        } as any).select().single();
        
        // Add to history
        if (newAnalysis) {
          setAnalysisHistory(prev => [newAnalysis, ...prev.slice(0, 9)]);
        }
      }
      toast({ title: "Analysis complete", description: `Successfully analyzed ${data?.keywords?.length || 0} keywords.` });
    } catch (err: any) {
      console.error("Analysis error:", err);
      
      // Fallback to demo data on error
      toast({ 
        title: "Using Demo Data", 
        description: "Backend not available. Showing demo results. Deploy your Supabase project for real analysis.",
        variant: "default"
      });
      setResult(DEMO_SEO_ANALYSIS);
      if (DEMO_SEO_ANALYSIS?.keywords?.length) {
        setSelectedKeyword(DEMO_SEO_ANALYSIS.keywords[0].keyword);
      }
    } finally {
      setAnalyzing(false);
      setAnalysisProgress({ current: 0, total: 0, status: "" });
    }
  };

  const selectedData = result?.keywords.find((k) => k.keyword === selectedKeyword);

  // Chart data
  const keywordScoreData = result?.keywords.map((kw) => ({
    name: kw.keyword.length > 14 ? kw.keyword.slice(0, 14) + "…" : kw.keyword,
    difficulty: kw.difficultyScore || ({ low: 30, medium: 60, high: 90 }[kw.difficulty] || 50),
    mentions: kw.mentionCount,
    targetWords: kw.targetWordCount || kw.contentBenchmark?.avgWordCount || 0,
  }));

  const intentDistribution = (() => {
    if (!result) return [];
    const counts: Record<string, number> = {};
    result.keywords.forEach((kw) => {
      const intent = kw.searchIntent || "unknown";
      counts[intent] = (counts[intent] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const contentTypePieData = (() => {
    if (!result) return [];
    const counts: Record<string, number> = {};
    result.keywords.forEach((kw) =>
      kw.topCompetitors.forEach((c) => {
        const type = c.contentType || "other";
        counts[type] = (counts[type] || 0) + 1;
      })
    );
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const serpFeatureData = (() => {
    if (!result?.overallInsights?.serpFeatureSummary) return [];
    return Object.entries(result.overallInsights.serpFeatureSummary).map(([key, value]) => ({
      name: serpFeatureLabels[key] || key.replace(/_/g, " "),
      count: value,
    }));
  })();

  const competitorScoreData = selectedData?.topCompetitors
    .filter((c) => c.contentScore !== undefined)
    .map((c) => ({
      name: c.source.length > 18 ? c.source.slice(0, 18) + "…" : c.source,
      score: c.contentScore || 0,
      words: Math.round((c.wordCount || 0) / 100),
    }));

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  const isEnrichedRecs = result?.overallInsights?.recommendations?.length &&
    typeof result.overallInsights.recommendations[0] !== "string";

  const loadPastAnalysis = (analysis: any) => {
    setResult(analysis.analysis);
    if (analysis.analysis?.keywords?.length) {
      setSelectedKeyword(analysis.analysis.keywords[0].keyword);
    }
    setShowHistory(false);
    toast({ title: "Loaded past analysis", description: `From ${new Date(analysis.created_at).toLocaleDateString()}` });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Search className="text-primary" size={28} />
              SERP Analysis
            </h1>
            <p className="text-muted-foreground mt-1">
              Industry-standard competitive analysis with content benchmarks, search intent mapping & SERP features
            </p>
          </div>
          <div className="flex gap-2">
            {analysisHistory.length > 0 && (
              <Button onClick={() => setShowHistory(!showHistory)} variant="outline" size="lg">
                <History className="mr-2" size={18} />
                History ({analysisHistory.length})
              </Button>
            )}
            <Button onClick={handleAnalyze} disabled={analyzing || !niche} size="lg">
              {analyzing ? <Loader2 className="animate-spin mr-2" size={18} /> : <TrendingUp className="mr-2" size={18} />}
              {analyzing ? "Analyzing..." : "Run SERP Analysis"}
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        {analyzing && analysisProgress.total > 0 && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{analysisProgress.status}</span>
                  <span className="text-muted-foreground">
                    {analysisProgress.current} / {analysisProgress.total} keywords
                  </span>
                </div>
                <Progress 
                  value={(analysisProgress.current / analysisProgress.total) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Niche & Keywords */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {!user && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Sparkles size={16} />
                    <strong>Demo Mode:</strong> Try the SEO Analysis without logging in! Enter your niche and keywords below, or use the demo button.
                  </p>
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Niche / Industry</label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g., Content Marketing, SaaS, Fitness"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={keywords.join(", ")}
                    onChange={(e) => setKeywords(e.target.value.split(",").map(k => k.trim()).filter(Boolean))}
                    placeholder="e.g., content marketing, SEO tips, social media"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              {!user && (
                <Button 
                  onClick={() => {
                    setNiche("Content Marketing");
                    setKeywords(["content marketing strategy", "SEO best practices", "social media marketing"]);
                    toast({ title: "Demo Data Loaded", description: "Click 'Run SERP Analysis' to see results!" });
                  }}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <Sparkles className="mr-2" size={16} />
                  Load Demo Data
                </Button>
              )}
              
              {niche && keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Preview:</span>
                  <Badge variant="default">{niche}</Badge>
                  {keywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis History Panel */}
        {showHistory && analysisHistory.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History size={18} className="text-primary" />
                Analysis History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysisHistory.map((hist) => (
                  <div
                    key={hist.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => loadPastAnalysis(hist)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{hist.niche}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {hist.keywords?.length || 0} keywords • {new Date(hist.created_at).toLocaleDateString()} at {new Date(hist.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Load <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* ===== OVERVIEW DASHBOARD ===== */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-foreground">{result.keywords.length}</div>
                    <div className="text-sm text-muted-foreground mt-1">Keywords Analyzed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {result.overallInsights?.avgWordCount || "—"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Avg Word Count</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {result.overallInsights?.avgContentScore || "—"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Avg Content Score</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-foreground capitalize">
                      {result.overallInsights?.dominantSearchIntent || result.overallInsights?.dominantContentType || "—"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Dominant Intent</div>
                  </CardContent>
                </Card>
              </div>

              {/* ===== CHARTS ROW ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Difficulty & Target Words */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 size={18} className="text-primary" />
                      Keyword Difficulty & Benchmarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={keywordScoreData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                        <Legend />
                        <Bar dataKey="difficulty" name="Difficulty" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="mentions" name="Mentions" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Search Intent Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye size={18} className="text-primary" />
                      Search Intent Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={intentDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {intentDistribution.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Content Type Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe size={18} className="text-primary" />
                      Content Type Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={contentTypePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {contentTypePieData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* SERP Features */}
                {serpFeatureData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles size={18} className="text-primary" />
                        SERP Features Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={serpFeatureData} layout="vertical" barSize={20}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                          <Bar dataKey="count" name="Occurrences" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* ===== KEYWORD DEEP DIVE ===== */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target size={20} className="text-primary" />
                  Keyword Deep Dive
                </h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {result.keywords.map((kw) => (
                    <Button
                      key={kw.keyword}
                      variant={selectedKeyword === kw.keyword ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedKeyword(kw.keyword)}
                    >
                      {kw.keyword}
                      {kw.searchIntent && (
                        <span className="ml-1">{intentConfig[kw.searchIntent]?.icon || "📌"}</span>
                      )}
                      <Badge className={`ml-2 text-[10px] ${difficultyColor[kw.difficulty]}`} variant="outline">
                        {kw.difficultyScore || kw.difficulty}
                      </Badge>
                    </Button>
                  ))}
                </div>

                {selectedData && (
                  <motion.div key={selectedData.keyword} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Keyword Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <div className="text-sm text-muted-foreground">Intent</div>
                          <div className="mt-1">
                            <Badge variant="outline" className={`${intentConfig[selectedData.searchIntent || ""]?.color || "bg-muted"}`}>
                              {intentConfig[selectedData.searchIntent || ""]?.icon} {selectedData.searchIntent || "—"}
                            </Badge>
                          </div>
                          {selectedData.intentConfidence && (
                            <div className="text-xs text-muted-foreground mt-1">{selectedData.intentConfidence}% confidence</div>
                          )}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <div className="text-sm text-muted-foreground">Difficulty</div>
                          <div className="text-2xl font-bold mt-1">{selectedData.difficultyScore || "—"}</div>
                          <Progress value={selectedData.difficultyScore || 50} className="h-1.5 mt-2" />
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <div className="text-sm text-muted-foreground">Target Words</div>
                          <div className="text-2xl font-bold mt-1">{selectedData.targetWordCount?.toLocaleString() || "—"}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <div className="text-sm text-muted-foreground">Format</div>
                          <div className="text-sm font-medium mt-2">{selectedData.recommendedContentFormat || "—"}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <div className="text-sm text-muted-foreground">Competitors</div>
                          <div className="text-2xl font-bold mt-1">{selectedData.topCompetitors.length}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* SERP Features for this keyword */}
                    {selectedData.serpFeatures && selectedData.serpFeatures.length > 0 && (
                      <Card>
                        <CardHeader><CardTitle className="text-base">SERP Features</CardTitle></CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedData.serpFeatures.map((f) => (
                              <Badge key={f} variant="secondary" className="text-sm">
                                {serpFeatureLabels[f] || f.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Content Benchmark */}
                    {selectedData.contentBenchmark && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText size={16} className="text-primary" /> Content Benchmark
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedData.contentBenchmark ? (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                  <div className="text-lg font-bold">{(selectedData.contentBenchmark.avgWordCount || 0).toLocaleString()}</div>
                                  <div className="text-xs text-muted-foreground">Avg Words</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                  <div className="text-lg font-bold">{selectedData.contentBenchmark.avgH2Count || 0}</div>
                                  <div className="text-xs text-muted-foreground">Avg H2 Headings</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                  <div className="text-lg font-bold">{selectedData.contentBenchmark.avgImageCount || 0}</div>
                                  <div className="text-xs text-muted-foreground">Avg Images</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                  <div className="text-lg font-bold">{selectedData.contentBenchmark.avgReadingTime || 0} min</div>
                                  <div className="text-xs text-muted-foreground">Avg Reading Time</div>
                                </div>
                              </div>
                              {selectedData.contentBenchmark.structuralPatterns?.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-sm font-medium text-muted-foreground">Structural Patterns:</span>
                              {selectedData.contentBenchmark.structuralPatterns.map((p, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
                                  <span>{p}</span>
                                </div>
                              ))}
                            </div>
                          )}
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">No content benchmark data available</div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Competitor Table with Scores */}
                    <Card>
                      <CardHeader><CardTitle className="text-base">Top Ranking Competitors</CardTitle></CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">#</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Source</TableHead>
                              <TableHead>Words</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Density</TableHead>
                              <TableHead>Type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedData.topCompetitors.map((comp) => (
                              <TableRow key={comp.rank}>
                                <TableCell className="font-bold">{comp.rank}</TableCell>
                                <TableCell className="font-medium max-w-[200px] truncate">{comp.title}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{comp.source}</TableCell>
                                <TableCell>{comp.wordCount?.toLocaleString() || "—"}</TableCell>
                                <TableCell>
                                  {comp.contentScore ? (
                                    <div className="flex items-center gap-2">
                                      <Progress value={comp.contentScore} className="h-1.5 w-12" />
                                      <span className="text-xs font-medium">{comp.contentScore}</span>
                                    </div>
                                  ) : "—"}
                                </TableCell>
                                <TableCell>{comp.keywordDensity}</TableCell>
                                <TableCell>
                                  <Badge className={`text-xs ${contentTypeColor[comp.contentType] || "bg-muted text-muted-foreground"}`} variant="secondary">
                                    {comp.contentType}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {/* Strengths & Weaknesses */}
                        {selectedData.topCompetitors.some(c => c.strengths?.length || c.weaknesses?.length) && (
                          <div className="mt-6 space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground">Competitor Analysis</h4>
                            {selectedData.topCompetitors.slice(0, 3).map((comp) => (
                              (comp.strengths?.length || comp.weaknesses?.length) ? (
                                <div key={comp.rank} className="p-3 rounded-lg border border-border bg-muted/30">
                                  <div className="font-medium text-sm mb-2">#{comp.rank} {comp.source}</div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {comp.strengths?.length ? (
                                      <div className="space-y-1">
                                        {comp.strengths.map((s, i) => (
                                          <div key={i} className="flex items-start gap-1.5 text-xs">
                                            <CheckCircle2 size={12} className="text-green-400 mt-0.5 shrink-0" />
                                            <span className="text-muted-foreground">{s}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                    {comp.weaknesses?.length ? (
                                      <div className="space-y-1">
                                        {comp.weaknesses.map((w, i) => (
                                          <div key={i} className="flex items-start gap-1.5 text-xs">
                                            <XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                                            <span className="text-muted-foreground">{w}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              ) : null
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Wins */}
                    {selectedData.quickWins && selectedData.quickWins.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Zap size={16} className="text-chart-3" /> Quick Wins
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedData.quickWins.map((qw, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-chart-3/5 border border-chart-3/20">
                                <Zap size={14} className="text-chart-3 mt-0.5 shrink-0" />
                                <span className="text-sm text-foreground">{qw}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Opportunity & Related Keywords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Lightbulb size={16} className="text-yellow-400" /> Content Opportunity
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm">{selectedData.opportunity}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Related Keywords</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedData.relatedKeywords.map((rk) => (
                              <Badge key={rk} variant="outline">{rk}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ===== STRATEGIC INSIGHTS ===== */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers size={18} className="text-primary" />
                    Strategic Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="recommendations" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                      <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
                      <TabsTrigger value="strategy">Content Strategy</TabsTrigger>
                    </TabsList>

                    <TabsContent value="recommendations">
                      {isEnrichedRecs ? (
                        <div className="space-y-3">
                          {(result.overallInsights?.recommendations as Recommendation[] || []).map((rec, i) => {
                            const config = priorityConfig[rec.priority] || priorityConfig.low;
                            const Icon = config.icon;
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`p-4 rounded-lg border ${config.color}`}
                              >
                                <div className="flex items-start gap-3">
                                  <Icon size={16} className="text-primary mt-0.5 shrink-0" />
                                  <div className="flex-1">
                                    <div className="font-medium text-foreground text-sm">{rec.action}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{rec.impact}</div>
                                    <div className="flex gap-3 mt-2">
                                      <Badge variant="outline" className="text-[10px]">
                                        Priority: {rec.priority}
                                      </Badge>
                                      <Badge variant="outline" className={`text-[10px] ${effortColors[rec.effort] || ""}`}>
                                        Effort: {rec.effort}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {(result.overallInsights?.recommendations as string[] || []).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </TabsContent>

                    <TabsContent value="gaps">
                      {result.overallInsights?.contentGaps?.length ? (
                        <div className="space-y-2">
                          {result.overallInsights.contentGaps.map((gap, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                              <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
                              <span className="text-sm text-foreground">{gap}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No content gaps detected.</p>
                      )}

                      {result.overallInsights?.topAuthorityDomains?.length ? (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Top Authority Domains</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.overallInsights.topAuthorityDomains.map((d) => (
                              <Badge key={d} variant="secondary">{d}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </TabsContent>

                    <TabsContent value="strategy">
                      {result.overallInsights?.contentStrategy ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="font-medium text-sm">Pillar Content</span>
                            </div>
                            <p className="text-foreground text-sm">{result.overallInsights.contentStrategy.pillarContent}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Supporting Content</span>
                            <div className="space-y-2 mt-2">
                              {result.overallInsights.contentStrategy.supportingContent.map((s, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <ArrowRight size={12} className="text-primary/60" />
                                  <span>{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50 border border-border">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Calendar Suggestion</span>
                            <p className="text-sm text-foreground mt-1">{result.overallInsights.contentStrategy.contentCalendarSuggestion}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No strategy data available.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Common Topics */}
              {result.overallInsights?.commonTopics?.length ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-start">
                      <div>
                        <span className="text-sm text-muted-foreground">Common Topics:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.overallInsights.commonTopics.map((t) => (
                            <Badge key={t} variant="secondary">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </motion.div>

            <div className="flex justify-end mt-8">
              <div className="flex gap-3">
                <Button onClick={() => exportToCSV(result, niche)} variant="outline" size="lg">
                  <Download className="mr-2" size={18} />
                  Export Keywords
                </Button>
                <Button onClick={() => exportCompetitorsToCSV(result, niche)} variant="outline" size="lg">
                  <Download className="mr-2" size={18} />
                  Export Competitors
                </Button>
                <Button onClick={() => navigate("/content-plan")} size="lg">
                  Next: Generate Content Plan →
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SeoAnalysis;
