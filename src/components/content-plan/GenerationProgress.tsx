import { memo } from "react";
import { Progress } from "@/components/ui/progress";

interface GenerationProgressProps {
  progress: number;
  visible: boolean;
}

export const GenerationProgress = memo(function GenerationProgress({
  progress,
  visible,
}: GenerationProgressProps) {
  if (!visible) return null;

  const label =
    progress < 30
      ? "Analyzing competitive landscape…"
      : progress < 60
        ? "Mapping keywords to content types…"
        : progress < 90
          ? "Sequencing topics for maximum impact…"
          : "Finalizing your plan…";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-3" role="status" aria-live="polite">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-primary">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
});
