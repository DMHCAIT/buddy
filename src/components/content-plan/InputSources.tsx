import { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface InputSourcesProps {
  niche: string;
  keywords: string[];
  longTailKeywords: string[];
  serpInsights: any;
  orgGoals: string;
  orgVision: string;
  onGoalsUpdated?: (goals: string, vision: string) => void;
  onNicheUpdated?: (niche: string, keywords: string[]) => void;
}

export const InputSources = memo(function InputSources({
  niche,
  keywords,
  longTailKeywords,
  serpInsights,
  orgGoals,
  orgVision,
  onGoalsUpdated,
  onNicheUpdated,
}: InputSourcesProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [goals, setGoals] = useState(orgGoals);
  const [vision, setVision] = useState(orgVision);
  const [saving, setSaving] = useState(false);

  // Niche/keywords editing state
  const [editingNiche, setEditingNiche] = useState(false);
  const [editNiche, setEditNiche] = useState(niche);
  const [editKeywords, setEditKeywords] = useState<string[]>(keywords);
  const [newKeyword, setNewKeyword] = useState("");
  const [savingNiche, setSavingNiche] = useState(false);

  const startEdit = () => {
    setGoals(orgGoals);
    setVision(orgVision);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ org_goals: goals, org_vision: vision } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      setEditing(false);
      onGoalsUpdated?.(goals, vision);
    }
  }, [user, goals, vision, toast, onGoalsUpdated]);

  const startNicheEdit = () => {
    setEditNiche(niche);
    setEditKeywords([...keywords]);
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
    if (!user) return;
    setSavingNiche(true);
    const { error } = await supabase
      .from("profiles")
      .update({ niche: editNiche, keywords: editKeywords } as any)
      .eq("user_id", user.id);
    setSavingNiche(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      setEditingNiche(false);
      onNicheUpdated?.(editNiche, editKeywords);
    }
  }, [user, editNiche, editKeywords, toast, onNicheUpdated]);

  return (
    <div className="space-y-4" role="region" aria-label="Data sources">
      {/* Analyze My Site */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            Analyze My Site
          </h3>
          <div className="flex items-center gap-2">
            {!editingNiche && niche && (
              <button onClick={startNicheEdit} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Pencil size={12} /> Edit
              </button>
            )}
            {!niche && (
              <button onClick={() => navigate("/get-started")} className="text-xs text-primary hover:underline">
                Run Analysis →
              </button>
            )}
          </div>
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
        ) : niche ? (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Niche:</span>{" "}
              <span className="font-medium">{niche}</span>
            </p>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5" role="list" aria-label="Keywords">
                {keywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-xs" role="listitem">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No site analysis yet. Analyze your site to auto-fill niche & keywords.
          </p>
        )}
      </section>

      {/* SERP Analysis */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-foreground" aria-hidden="true" />
            SERP Analysis
          </h3>
          {!serpInsights && (
            <button onClick={() => navigate("/seo-analysis")} className="text-xs text-primary hover:underline">
              Run SERP Analysis →
            </button>
          )}
        </div>
        {serpInsights ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="secondary" className="text-xs">
                {serpInsights?.keywords?.length || 0} keywords analyzed
              </Badge>
              {serpInsights?.overallInsights?.dominantSearchIntent && (
                <Badge variant="outline" className="text-xs border-primary/30 text-primary capitalize">
                  {serpInsights.overallInsights.dominantSearchIntent} intent
                </Badge>
              )}
              {serpInsights?.overallInsights?.avgContentScore && (
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  Score: {serpInsights.overallInsights.avgContentScore}/100
                </Badge>
              )}
            </div>
            {serpInsights?.overallInsights?.contentGaps?.length > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Gaps found:</span>{" "}
                {serpInsights.overallInsights.contentGaps.slice(0, 2).join(" • ")}
              </p>
            )}
            {longTailKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5" role="list" aria-label="Long-tail keywords">
                {longTailKeywords.map((kw, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-primary/30 text-primary" role="listitem">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No SERP analysis yet. Run one to add competitive insights & long-tail keywords.
          </p>
        )}
      </section>

      {/* Personalization */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" aria-hidden="true" />
            Personalization
          </h3>
          <div className="flex items-center gap-2">
            {!editing && (orgGoals || orgVision) && (
              <button onClick={startEdit} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Pencil size={12} /> Edit
              </button>
            )}
            {!editing && !orgGoals && !orgVision && (
              <button onClick={startEdit} className="text-xs text-primary hover:underline">
                Set Goals & Vision →
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Goals</label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g., Increase online leads by 50%..."
                rows={2}
                className="input-base w-full text-sm resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Vision</label>
              <textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="e.g., To create a safer world through accessible services..."
                rows={2}
                className="input-base w-full text-sm resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={cancelEdit} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1">
                <X size={12} /> Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50">
                <Check size={12} /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : orgGoals || orgVision ? (
          <div className="space-y-1.5">
            {orgGoals && (
              <p className="text-sm">
                <span className="text-muted-foreground">Goals:</span>{" "}
                <span className="font-medium line-clamp-2">{orgGoals}</span>
              </p>
            )}
            {orgVision && (
              <p className="text-sm">
                <span className="text-muted-foreground">Vision:</span>{" "}
                <span className="font-medium line-clamp-2">{orgVision}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No goals or vision set. Add them to align content strategy.
          </p>
        )}
      </section>
    </div>
  );
});
