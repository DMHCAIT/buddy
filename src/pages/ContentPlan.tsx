import { useMemo } from "react";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Calendar,
  RefreshCw,
  Save,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { exportPlanAsCSV, exportPlanAsPDF } from "@/lib/content-plan-export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useContentPlan } from "@/components/content-plan/useContentPlan";
import { PlanHeader } from "@/components/content-plan/PlanHeader";
import { InputSources } from "@/components/content-plan/InputSources";
import { PlanItem } from "@/components/content-plan/PlanItem";
import { GenerationProgress } from "@/components/content-plan/GenerationProgress";


import { useState } from "react";

const ContentPlan = () => {
  const {
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
  } = useContentPlan();

  const [showControls, setShowControls] = useState(false);

  // Memoize type distribution for summary
  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    plan.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }, [plan]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PlanHeader
        onSignOut={async () => {
          await signOut();
          navigate("/");
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar size={28} className="text-primary" aria-hidden="true" />
            <div>
              <h1 className="text-3xl font-bold">Content Plan</h1>
              <p className="text-sm text-muted-foreground">30-day billing cycle</p>
            </div>
          </div>
          {plan.length > 0 && (
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-xl px-4 py-2"
              aria-expanded={showControls}
              aria-controls="plan-controls"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          )}
        </div>


        {/* Generation Progress */}
        <GenerationProgress progress={generationProgress} visible={generating} />

        {/* Input Sources & Controls */}
        {(plan.length === 0 || showControls) && (
          <div id="plan-controls" className="space-y-4 mb-8">
            <InputSources
              niche={niche}
              keywords={keywords}
              longTailKeywords={longTailKeywords}
              serpInsights={serpInsights}
              orgGoals={orgGoals}
              orgVision={orgVision}
              onGoalsUpdated={(g, v) => { setOrgGoals(g); setOrgVision(v); }}
              onNicheUpdated={(n, kws) => { setNiche(n); setKeywords(kws); }}
            />
            {/* Tone + Generate */}
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label htmlFor="tone-select" className="block text-sm font-medium mb-1">
                  Tone
                </label>
                <select
                  id="tone-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="educational">Educational</option>
                  <option value="conversational">Conversational</option>
                </select>
              </div>
              <button
                onClick={generate}
                disabled={generating || !niche}
                className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                aria-busy={generating}
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Generating...
                  </>
                ) : plan.length > 0 ? (
                  <>
                    <RefreshCw size={16} /> Regenerate Plan
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate Plan
                  </>
                )}
              </button>
              <button
                onClick={loadDemoData}
                disabled={generating}
                className="bg-accent text-accent-foreground font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <FileText size={16} /> Load Demo Data
              </button>
              {showControls && (
                <button
                  onClick={() => setShowControls(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Plan List */}
        {plan.length > 0 ? (
          <section aria-label="Content plan items">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">{plan.length} Posts Planned</h2>
                {Object.keys(typeDistribution).length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {Object.entries(typeDistribution)
                      .map(([type, count]) => `${count} ${type}`)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl px-4 py-2 transition-colors"
                      aria-label="Export options"
                    >
                      <Download size={14} /> Export
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportPlanAsCSV(plan, niche)}>
                      <FileSpreadsheet size={14} className="mr-2" /> Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportPlanAsPDF(plan, niche)}>
                      <FileText size={14} className="mr-2" /> Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  onClick={savePlan}
                  disabled={saving}
                  className="bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
                  aria-busy={saving}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {savedPlanId ? "Update Plan" : "Save Plan"}
                </button>
              </div>
            </div>
            <div className="space-y-3" role="list">
              {plan.map((item, idx) => (
                <PlanItem
                  key={`${item.day}-${idx}`}
                  item={item}
                  index={idx}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </section>
        ) : (
          !generating && (
            <div className="bg-card border border-border rounded-2xl p-12 text-center" role="status">
              <Calendar size={48} className="text-muted-foreground/30 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-lg font-semibold mb-2">No Content Plan Yet</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Generate your first 30-day content plan using the form above.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default ContentPlan;
