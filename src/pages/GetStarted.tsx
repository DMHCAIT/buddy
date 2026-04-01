import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Globe, Sparkles, Loader2, Tag, TrendingUp, Target, Layers, AlertTriangle, Search, ArrowRight, Pencil, Check, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


interface EnrichedKeyword {
  term: string;
  intent: string;
  difficulty: string;
  priority: string;
  cluster: string;
}

interface EnrichedLongTail {
  term: string;
  intent: string;
  difficulty: string;
  searchContext: string;
}

interface TopicCluster {
  pillar: string;
  supporting: string[];
}

interface AnalysisResult {
  niche: string;
  subNiches?: string[];
  description: string;
  keywords: EnrichedKeyword[] | string[];
  longTailKeywords: EnrichedLongTail[] | string[];
  topicClusters?: TopicCluster[];
  competitorKeywordGaps?: string[];
  flatKeywords?: string[];
  flatLongTail?: string[];
}

const intentColors: Record<string, string> = {
  informational: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  navigational: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  commercial: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  transactional: "bg-chart-4/15 text-chart-4 border-chart-4/30",
};

const difficultyConfig: Record<string, { color: string; value: number }> = {
  low: { color: "text-green-500", value: 30 },
  medium: { color: "text-yellow-500", value: 60 },
  high: { color: "text-red-500", value: 90 },
};

const priorityColors: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  low: "bg-muted text-muted-foreground border-border",
};

const GetStarted = () => {
  const { user, loading } = useAuth();
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  // Inline editing state for niche & keywords
  const [editingNiche, setEditingNiche] = useState(false);
  const [editNiche, setEditNiche] = useState("");
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [savingNiche, setSavingNiche] = useState(false);

  const startNicheEdit = () => {
    setEditNiche(result?.niche || "");
    const kws = result?.keywords || [];
    const flat = kws.map((k: any) => (typeof k === "string" ? k : k.term));
    setEditKeywords(flat);
    setNewKeyword("");
    setEditingNiche(true);
  };

  const cancelNicheEdit = () => setEditingNiche(false);

  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (kw && !editKeywords.includes(kw)) {
      setEditKeywords([...editKeywords, kw]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (idx: number) => {
    setEditKeywords(editKeywords.filter((_, i) => i !== idx));
  };

  const saveNicheEdit = useCallback(async () => {
    setSavingNiche(true);
    
    // Save to session storage for non-logged-in users
    const updatedResult = { ...result, niche: editNiche, keywords: editKeywords };
    sessionStorage.setItem('siteAnalysis', JSON.stringify(updatedResult));
    
    // If user is logged in, also save to database
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ niche: editNiche, keywords: editKeywords } as any)
        .eq("user_id", user.id);
      if (error) {
        toast({ title: "Error saving", description: error.message, variant: "destructive" });
        setSavingNiche(false);
        return;
      }
    }
    
    setSavingNiche(false);
    toast({ title: "Saved" });
    setEditingNiche(false);
    setResult(updatedResult);
  }, [user, editNiche, editKeywords, toast, result]);
  useEffect(() => {
    // Try to load from session storage first (for non-logged-in users)
    const storedAnalysis = sessionStorage.getItem('siteAnalysis');
    if (storedAnalysis) {
      try {
        const data = JSON.parse(storedAnalysis);
        if (data.website_url) {
          setUrl(data.website_url);
          setResult(data);
          setSaved(true);
        }
      } catch (e) {
        console.error('Failed to parse stored analysis:', e);
      }
    }
    
    // If user is logged in, load from database (overrides session storage)
    if (user) {
      supabase
        .from("profiles")
        .select("website_url, niche, keywords")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.website_url) {
            setUrl(data.website_url);
            // Show minimal cached result
            setResult({
              niche: data.niche || "",
              description: "",
              keywords: data.keywords || [],
              longTailKeywords: [],
            });
            setSaved(true);
          }
        });
    }
  }, [user]);

  if (loading) return null;
  // Allow access without login - demo mode

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setAnalyzing(true);
    setResult(null);
    setSaved(false);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-site", {
        body: { url: trimmed },
      });

      if (error) throw error;

      if (data?.error) {
        toast({ title: "Analysis failed", description: data.error, variant: "destructive" });
      } else if (data?.success && data.data) {
        const analysisData = { ...data.data, website_url: trimmed };
        setResult(analysisData);

        // Save to session storage (works for all users)
        sessionStorage.setItem('siteAnalysis', JSON.stringify(analysisData));

        // If user is logged in, also save to database
        if (user) {
          const allKeywords = [...(data.data.flatKeywords || []), ...(data.data.flatLongTail || [])];
          const { error: updateErr } = await supabase
            .from("profiles")
            .update({
              website_url: trimmed,
              niche: data.data.niche,
              keywords: allKeywords,
            })
            .eq("user_id", user.id);

          if (updateErr) {
            toast({ title: "Analysis complete", description: "Saved to session (database save failed).", variant: "default" });
          } else {
            setSaved(true);
            toast({ title: "Analysis saved", description: "Your niche and keywords have been saved." });
          }
        } else {
          // Not logged in - just confirm session storage save
          setSaved(true);
          toast({ title: "Analysis complete", description: "Results saved to your session." });
        }
      } else {
        toast({ title: "Unexpected response", description: "Please try again.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const isEnrichedKeywords = result?.keywords?.length && typeof result.keywords[0] !== "string";
  const isEnrichedLongTail = result?.longTailKeywords?.length && typeof result.longTailKeywords[0] !== "string";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Globe className="text-primary" size={28} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Analyze Your Website
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
              Deep-dive SEO analysis with keyword intent mapping, topic clusters, and competitive gap detection.
            </p>
          </div>

          {/* Input */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10 max-w-2xl mx-auto">
            <Input
              type="url"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 h-12 text-base rounded-xl border-border bg-card"
              onKeyDown={(e) => e.key === "Enter" && !analyzing && handleAnalyze()}
              disabled={analyzing}
            />
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !url.trim()}
              className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all"
            >
              {analyzing ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Sparkles size={18} className="mr-2" />}
              {analyzing ? "Analyzing…" : "Analyze My Site"}
            </Button>
          </div>


          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Niche Overview */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-primary" />
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Detected Niche</span>
                    </div>
                    {!editingNiche && (
                      <button onClick={startNicheEdit} className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Pencil size={12} /> Edit
                      </button>
                    )}
                  </div>

                  {editingNiche ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Niche</label>
                        <Input
                          value={editNiche}
                          onChange={(e) => setEditNiche(e.target.value)}
                          placeholder="e.g., Digital Marketing"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Keywords</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {editKeywords.map((kw, i) => (
                            <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1">
                              {kw}
                              <button onClick={() => removeKeyword(i)} className="hover:text-destructive">
                                <X size={10} />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                            placeholder="Add keyword…"
                            className="text-sm flex-1"
                          />
                          <button onClick={addKeyword} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1">
                            <Plus size={12} /> Add
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={cancelNicheEdit} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1">
                          <X size={12} /> Cancel
                        </button>
                        <button onClick={saveNicheEdit} disabled={savingNiche} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50">
                          <Check size={12} /> {savingNiche ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-foreground">{result.niche}</p>
                        {result.description && (
                          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{result.description}</p>
                        )}
                      </div>
                      {result.subNiches && result.subNiches.length > 0 && (
                        <div className="md:border-l md:border-border md:pl-6">
                          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sub-Niches</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {result.subNiches.map((sn, i) => (
                              <Badge key={i} variant="outline" className="text-sm">{sn}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabbed Results */}
              {isEnrichedKeywords ? (
                <Tabs defaultValue="keywords" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="keywords" className="gap-1.5"><Tag size={14} /> Keywords</TabsTrigger>
                    <TabsTrigger value="longtail" className="gap-1.5"><Search size={14} /> Long-Tail</TabsTrigger>
                    <TabsTrigger value="clusters" className="gap-1.5"><Layers size={14} /> Clusters</TabsTrigger>
                    <TabsTrigger value="gaps" className="gap-1.5"><Target size={14} /> Gaps</TabsTrigger>
                  </TabsList>

                  {/* Keywords Tab */}
                  <TabsContent value="keywords">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Tag size={18} className="text-primary" />
                          Target Keywords
                          <Badge variant="secondary" className="ml-auto">{(result.keywords as EnrichedKeyword[]).length} keywords</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(result.keywords as EnrichedKeyword[]).map((kw, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                            >
                              <span className="font-medium text-foreground flex-1">{kw.term}</span>
                              <Badge variant="outline" className={`text-xs border ${intentColors[kw.intent] || "bg-muted text-muted-foreground"}`}>
                                {kw.intent}
                              </Badge>
                              <div className="flex items-center gap-2 w-28">
                                <Progress value={difficultyConfig[kw.difficulty]?.value || 50} className="h-1.5 flex-1" />
                                <span className={`text-xs font-medium ${difficultyConfig[kw.difficulty]?.color || "text-muted-foreground"}`}>
                                  {kw.difficulty}
                                </span>
                              </div>
                              <Badge variant="outline" className={`text-xs border ${priorityColors[kw.priority] || ""}`}>
                                {kw.priority}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Long-tail Tab */}
                  <TabsContent value="longtail">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Search size={18} className="text-primary" />
                          Long-Tail Keywords
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {isEnrichedLongTail ? (
                            (result.longTailKeywords as EnrichedLongTail[]).map((kw, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="p-3 rounded-lg bg-muted/50 border border-border"
                              >
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-medium text-foreground flex-1">{kw.term}</span>
                                  <Badge variant="outline" className={`text-xs border ${intentColors[kw.intent] || ""}`}>
                                    {kw.intent}
                                  </Badge>
                                  <span className={`text-xs font-medium ${difficultyConfig[kw.difficulty]?.color || "text-muted-foreground"}`}>
                                    {kw.difficulty}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{kw.searchContext}</p>
                              </motion.div>
                            ))
                          ) : (
                            (result.longTailKeywords as string[]).map((kw, i) => (
                              <Badge key={i} variant="outline" className="text-sm px-3 py-1">{kw}</Badge>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Topic Clusters Tab */}
                  <TabsContent value="clusters">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Layers size={18} className="text-primary" />
                          Topic Clusters
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {result.topicClusters && result.topicClusters.length > 0 ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {result.topicClusters.map((cluster, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 rounded-xl border border-border bg-muted/30"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                  <h4 className="font-semibold text-foreground">{cluster.pillar}</h4>
                                </div>
                                <div className="space-y-1.5 pl-4">
                                  {cluster.supporting.map((s, j) => (
                                    <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <ArrowRight size={12} className="text-primary/60" />
                                      <span>{s}</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No topic clusters available. Re-run analysis for enriched results.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Competitor Gaps Tab */}
                  <TabsContent value="gaps">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target size={18} className="text-primary" />
                          Competitor Keyword Gaps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {result.competitorKeywordGaps && result.competitorKeywordGaps.length > 0 ? (
                          <div className="space-y-2">
                            {result.competitorKeywordGaps.map((gap, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                              >
                                <AlertTriangle size={16} className="text-destructive shrink-0" />
                                <span className="text-foreground text-sm">{gap}</span>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No gap data available. Re-run analysis for enriched results.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                /* Fallback: flat keyword display for cached/old data */
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Tag size={18} className="text-primary" />
                        <h3 className="font-semibold text-foreground text-lg">Keywords</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(result.keywords as any[]).map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                            {typeof kw === 'string' ? kw : kw.term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <Sparkles size={14} className="inline mr-1" />
                      Click "Analyze My Site" again for enriched results with intent mapping, difficulty scores, and topic clusters.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default GetStarted;
