import { useState, useEffect, useCallback, memo } from "react";
import { Target, Eye, ChevronDown, ChevronUp, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface OutcomesEditorProps {
  defaultExpanded?: boolean;
  onSaved?: (goals: string, vision: string) => void;
}

export const OutcomesEditor = memo(function OutcomesEditor({
  defaultExpanded = false,
  onSaved,
}: OutcomesEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [goals, setGoals] = useState("");
  const [vision, setVision] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("org_goals, org_vision")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setGoals((data as any).org_goals || "");
          setVision((data as any).org_vision || "");
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ org_goals: goals, org_vision: vision } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setDirty(false);
      toast({ title: "Outcomes saved", description: "Your goals & vision have been updated." });
      onSaved?.(goals, vision);
    }
    setSaving(false);
  }, [user, goals, vision, toast, onSaved]);

  const hasContent = goals.trim() || vision.trim();

  return (
    <section className="card-elevated overflow-hidden" aria-label="Personalization outcomes">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
        aria-expanded={expanded}
        aria-controls="outcomes-panel"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center">
            <Target size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Outcomes & Personalization</h3>
            <p className="text-xs text-muted-foreground">
              {hasContent
                ? "Goals & vision set — click to edit"
                : "Set your goals & vision to personalize AI content"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasContent && !expanded && (
            <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/8 rounded-full">
              Active
            </span>
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div id="outcomes-panel" className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="outcomes-goals" className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                  <Target size={14} className="text-primary" />
                  Organization Goals
                </label>
                <textarea
                  id="outcomes-goals"
                  value={goals}
                  onChange={(e) => { setGoals(e.target.value); setDirty(true); }}
                  placeholder="e.g., Increase online leads by 50%, establish thought leadership..."
                  rows={3}
                  className="input-base text-sm resize-none"
                />
              </div>

              <div>
                <label htmlFor="outcomes-vision" className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                  <Eye size={14} className="text-primary" />
                  Organization Vision
                </label>
                <textarea
                  id="outcomes-vision"
                  value={vision}
                  onChange={(e) => { setVision(e.target.value); setDirty(true); }}
                  placeholder="e.g., To create a safer world through accessible services..."
                  rows={3}
                  className="input-base text-sm resize-none"
                />
              </div>

              {dirty && (
                <button onClick={handleSave} disabled={saving} className="w-full btn-primary text-sm py-2.5">
                  {saving ? (
                    <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Check size={14} /> Save Outcomes</>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
});
