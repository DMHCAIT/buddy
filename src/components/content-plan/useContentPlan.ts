import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DEMO_CONTENT_PLAN } from "@/lib/demo-data";
import type { ContentItem } from "./types";

export function useContentPlan() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [niche, setNiche] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [longTailKeywords, setLongTailKeywords] = useState<string[]>([]);
  const [tone, setTone] = useState("professional");
  const [plan, setPlan] = useState<ContentItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [serpInsights, setSerpInsights] = useState<any>(null);
  const [orgGoals, setOrgGoals] = useState("");
  const [orgVision, setOrgVision] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const days = 30;

  // Debounced auto-save ref
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Allow access without login - demo mode available

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
        if (data.longTailKeywords?.length || data.flatLongTail?.length) {
          const allLongTail = [...(data.flatLongTail || []), ...(data.longTailKeywords || [])]
            .map((k: any) => typeof k === 'string' ? k : k.term)
            .filter(Boolean);
          setLongTailKeywords(allLongTail);
        }
      } catch (e) {
        console.error('Failed to parse stored analysis:', e);
      }
    }
    
    // If user is logged in, load from database (overrides session storage)
    if (!user) {
      setProfileLoading(false);
      return;
    }
    
    const controller = new AbortController();

    Promise.all([
      supabase
        .from("profiles")
        .select("niche, keywords, org_goals, org_vision")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("serp_analyses" as any)
        .select("analysis, keywords")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("content_plans" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]).then(([profileRes, serpRes, planRes]) => {
      if (controller.signal.aborted) return;

      if (profileRes.data?.niche) setNiche(profileRes.data.niche);
      if (profileRes.data?.keywords?.length) setKeywords(profileRes.data.keywords);
      if ((profileRes.data as any)?.org_goals) setOrgGoals((profileRes.data as any).org_goals);
      if ((profileRes.data as any)?.org_vision) setOrgVision((profileRes.data as any).org_vision);

      if (serpRes.data) {
        setSerpInsights((serpRes.data as any).analysis);
        const analysis = (serpRes.data as any).analysis;
        if (analysis?.keywords) {
          const relatedKws = analysis.keywords
            .flatMap((k: any) => k.relatedKeywords || [])
            .filter((kw: string, i: number, arr: string[]) => arr.indexOf(kw) === i)
            .slice(0, 10);
          if (relatedKws.length) setLongTailKeywords(relatedKws);
        }
      }

      if (planRes.data) {
        const saved = planRes.data as any;
        setSavedPlanId(saved.id);
        setPlan(saved.items || []);
        if (saved.tone) setTone(saved.tone);
        if (!profileRes.data?.niche && saved.niche) setNiche(saved.niche);
        if (!profileRes.data?.keywords?.length && saved.keywords?.length) setKeywords(saved.keywords);
        if (saved.long_tail_keywords?.length) setLongTailKeywords(saved.long_tail_keywords);
      }

      setProfileLoading(false);
    });

    return () => controller.abort();
  }, [user]);

  const savePlanData = useCallback(
    async (planItems: ContentItem[], planId: string | null): Promise<string | null> => {
      if (!user || planItems.length === 0) return planId;
      const payload = {
        user_id: user.id,
        niche,
        keywords,
        long_tail_keywords: longTailKeywords,
        days,
        tone,
        items: planItems,
      };
      if (planId) {
        const { error } = await supabase
          .from("content_plans" as any)
          .update(payload as any)
          .eq("id", planId);
        if (error) throw error;
        return planId;
      } else {
        const { data, error } = await supabase
          .from("content_plans" as any)
          .insert(payload as any)
          .select("id")
          .single();
        if (error) throw error;
        return (data as any)?.id || null;
      }
    },
    [user, niche, keywords, longTailKeywords, tone, days]
  );

  const debouncedAutoSave = useCallback(
    (updatedPlan: ContentItem[]) => {
      if (!savedPlanId) return;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        try {
          await savePlanData(updatedPlan, savedPlanId);
        } catch {
          // silent fail for auto-save
        }
      }, 1500);
    },
    [savedPlanId, savePlanData]
  );

  const generate = useCallback(async () => {
    if (!niche) {
      toast({ title: "No niche set", description: "Please enter a niche first.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setGenerationProgress(0);

    // Simulate progress steps
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => Math.min(prev + Math.random() * 12, 90));
    }, 800);

    try {
      // Re-fetch latest SERP analysis to ensure fresh data
      let freshSerpInsights = serpInsights;
      try {
        const { data: freshSerp } = await supabase
          .from("serp_analyses" as any)
          .select("analysis, keywords")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (freshSerp) {
          freshSerpInsights = (freshSerp as any).analysis;
          setSerpInsights(freshSerpInsights);
          // Also update long-tail keywords from fresh SERP
          const analysis = (freshSerp as any).analysis;
          if (analysis?.keywords) {
            const relatedKws = analysis.keywords
              .flatMap((k: any) => k.relatedKeywords || [])
              .filter((kw: string, i: number, arr: string[]) => arr.indexOf(kw) === i)
              .slice(0, 10);
            if (relatedKws.length) setLongTailKeywords(relatedKws);
          }
        }
      } catch {
        // Use existing serpInsights if fetch fails
      }

      // If no user, use demo data
      if (!user) {
        clearInterval(progressInterval);
        setGenerationProgress(100);
        setPlan(DEMO_CONTENT_PLAN);
        toast({ 
          title: "Demo content plan loaded!", 
          description: `${DEMO_CONTENT_PLAN.length} posts planned. Sign in to generate custom plans.` 
        });
        setTimeout(() => setGenerationProgress(0), 1000);
        setGenerating(false);
        return;
      }

      const allKeywords = [...keywords, ...longTailKeywords];
      const { data, error } = await supabase.functions.invoke("generate-content-plan", {
        body: {
          niche,
          keywords: allKeywords,
          longTailKeywords,
          days,
          tone,
          serpInsights: freshSerpInsights || undefined,
          orgGoals: orgGoals || undefined,
          orgVision: orgVision || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const newPlan = data.plan || [];
      setPlan(newPlan);
      const id = await savePlanData(newPlan, savedPlanId);
      setSavedPlanId(id);
      toast({ title: "Content plan generated & saved!", description: `${newPlan.length} posts planned.` });
    } catch (e: any) {
      clearInterval(progressInterval);
      // Fallback to demo data on error
      setPlan(DEMO_CONTENT_PLAN);
      toast({ 
        title: "Using demo data", 
        description: "API unavailable. Showing sample content plan.", 
        variant: "destructive" 
      });
    } finally {
      setGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  }, [niche, keywords, longTailKeywords, days, tone, serpInsights, orgGoals, orgVision, savedPlanId, savePlanData, toast, user]);

  const savePlan = useCallback(async () => {
    if (!user || plan.length === 0) return;
    setSaving(true);
    try {
      const id = await savePlanData(plan, savedPlanId);
      setSavedPlanId(id);
      toast({ title: "Plan saved!", description: "Your content plan has been stored." });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [user, plan, savedPlanId, savePlanData, toast]);

  const updateItem = useCallback(
    (idx: number, updates: Partial<ContentItem>) => {
      const updated = plan.map((item, i) => (i === idx ? { ...item, ...updates } : item));
      setPlan(updated);
      debouncedAutoSave(updated);
    },
    [plan, debouncedAutoSave]
  );

  const removeItem = useCallback(
    (idx: number) => {
      const updated = plan.filter((_, i) => i !== idx);
      setPlan(updated);
      debouncedAutoSave(updated);
    },
    [plan, debouncedAutoSave]
  );

  const loadDemoData = useCallback(() => {
    setPlan(DEMO_CONTENT_PLAN);
    setNiche("Content Marketing");
    setKeywords(["content marketing strategy", "SEO best practices", "email marketing"]);
    toast({ 
      title: "Demo data loaded!", 
      description: `${DEMO_CONTENT_PLAN.length} sample posts loaded. Try editing or exporting!` 
    });
  }, [toast]);

  return {
    user,
    signOut,
    authLoading,
    profileLoading,
    niche,
    setNiche,
    keywords,
    setKeywords,
    longTailKeywords,
    tone,
    setTone,
    plan,
    generating,
    generationProgress,
    saving,
    savedPlanId,
    serpInsights,
    orgGoals,
    orgVision,
    setOrgGoals,
    setOrgVision,
    generate,
    savePlan,
    updateItem,
    removeItem,
    loadDemoData,
    navigate,
  };
}
