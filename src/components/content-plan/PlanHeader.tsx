import { memo } from "react";
import { Sparkles, LogOut } from "lucide-react";

interface PlanHeaderProps {
  onSignOut: () => void;
}

export const PlanHeader = memo(function PlanHeader({ onSignOut }: PlanHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border" role="banner">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5" aria-label="BlitzNova AI Home">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles size={18} className="text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">BlitzNova AI</span>
        </a>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Sign out"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </header>
  );
});
