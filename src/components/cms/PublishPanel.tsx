import { useState } from "react";
import { Calendar, Clock, Globe, Send, Save, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type PostStatus = "draft" | "review" | "scheduled" | "published";

interface PublishPanelProps {
  status: PostStatus;
  onStatusChange: (status: PostStatus) => void;
  scheduledAt: Date | null;
  onScheduledAtChange: (date: Date | null) => void;
  platformWordpress: boolean;
  onPlatformWordpressChange: (v: boolean) => void;
  platformMedium: boolean;
  onPlatformMediumChange: (v: boolean) => void;
  onSave: (status: PostStatus) => void;
  saving: boolean;
  category: string;
  onCategoryChange: (v: string) => void;
  tags: string[];
  onTagsChange: (v: string[]) => void;
  seoTitle: string;
  onSeoTitleChange: (v: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (v: string) => void;
}

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: "Draft", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Clock },
  review: { label: "In Review", color: "bg-accent text-accent-foreground", icon: Clock },
  scheduled: { label: "Scheduled", color: "bg-primary/10 text-primary", icon: Calendar },
  published: { label: "Published", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: Globe },
};

const CATEGORIES = ["Technology", "Marketing", "Business", "Design", "Lifestyle", "Health", "Finance", "Education"];

export const PublishPanel = ({
  status, onStatusChange, scheduledAt, onScheduledAtChange,
  platformWordpress, onPlatformWordpressChange,
  platformMedium, onPlatformMediumChange,
  onSave, saving, category, onCategoryChange,
  tags, onTagsChange, seoTitle, onSeoTitleChange,
  seoDescription, onSeoDescriptionChange,
}: PublishPanelProps) => {
  const [tagInput, setTagInput] = useState("");
  const [showSeo, setShowSeo] = useState(false);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("09:00");

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleSchedule = (date: Date | undefined) => {
    if (!date) { onScheduledAtChange(null); return; }
    const [h, m] = scheduledTime.split(":").map(Number);
    date.setHours(h, m, 0, 0);
    onScheduledAtChange(date);
    onStatusChange("scheduled");
  };

  return (
    <div className="space-y-5">
      {/* Status */}
      <div className="card-elevated p-5 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_CONFIG) as PostStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  status === s
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                )}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category & Tags */}
      <div className="card-elevated p-5 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Organize</h3>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Category</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="input-base text-sm"
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Tags</label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add tag..."
              className="input-base text-sm flex-1"
            />
            <button onClick={addTag} className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/8 text-primary rounded-full text-xs font-medium">
                  {tag}
                  <button onClick={() => onTagsChange(tags.filter((_, j) => j !== i))} className="hover:text-destructive">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div className="card-elevated p-5 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Schedule</h3>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn(
                "input-base text-sm flex items-center gap-2 flex-1",
                !scheduledAt && "text-muted-foreground"
              )}>
                <Calendar size={14} />
                {scheduledAt ? format(scheduledAt, "PPP") : "Pick a date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarUI
                mode="single"
                selected={scheduledAt || undefined}
                onSelect={handleSchedule}
                disabled={(date) => date < new Date()}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => {
              setScheduledTime(e.target.value);
              if (scheduledAt) {
                const [h, m] = e.target.value.split(":").map(Number);
                const newDate = new Date(scheduledAt);
                newDate.setHours(h, m);
                onScheduledAtChange(newDate);
              }
            }}
            className="input-base text-sm w-28"
          />
        </div>
        {scheduledAt && (
          <p className="text-xs text-muted-foreground">
            Will publish on {format(scheduledAt, "PPP 'at' p")}
          </p>
        )}
      </div>

      {/* SEO */}
      <div className="card-elevated p-5">
        <button onClick={() => setShowSeo(!showSeo)} className="flex items-center justify-between w-full">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">SEO Metadata</h3>
          {showSeo ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>
        {showSeo && (
          <div className="space-y-3 mt-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">SEO Title <span className="text-muted-foreground/60">({seoTitle.length}/60)</span></label>
              <input value={seoTitle} onChange={(e) => onSeoTitleChange(e.target.value)} maxLength={60} className="input-base text-sm" placeholder="Custom SEO title..." />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Meta Description <span className="text-muted-foreground/60">({seoDescription.length}/160)</span></label>
              <textarea value={seoDescription} onChange={(e) => onSeoDescriptionChange(e.target.value)} maxLength={160} rows={3} className="input-base text-sm resize-none" placeholder="SEO meta description..." />
            </div>
          </div>
        )}
      </div>

      {/* Platforms */}
      <div className="card-elevated p-5">
        <button onClick={() => setShowPlatforms(!showPlatforms)} className="flex items-center justify-between w-full">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Publish To</h3>
          {showPlatforms ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>
        {showPlatforms && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#21759b]/10 flex items-center justify-center text-xs font-bold text-[#21759b]">W</div>
                <div>
                  <p className="text-sm font-medium">WordPress</p>
                  <p className="text-xs text-muted-foreground">Sync to your WP site</p>
                </div>
              </div>
              <Switch checked={platformWordpress} onCheckedChange={onPlatformWordpressChange} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00ab6c]/10 flex items-center justify-center text-xs font-bold text-[#00ab6c]">M</div>
                <div>
                  <p className="text-sm font-medium">Medium</p>
                  <p className="text-xs text-muted-foreground">Cross-post to Medium</p>
                </div>
              </div>
              <Switch checked={platformMedium} onCheckedChange={onPlatformMediumChange} />
            </div>
            {(platformWordpress || platformMedium) && (
              <p className="text-xs text-muted-foreground bg-accent/50 p-2 rounded-lg">
                Configure platform API keys in your profile settings to enable publishing.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => onSave(status === "scheduled" && scheduledAt ? "scheduled" : "published")}
          disabled={saving}
          className="w-full btn-primary"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {status === "scheduled" ? "Schedule Post" : "Publish Now"}
        </button>
        <button
          onClick={() => onSave("draft")}
          disabled={saving}
          className="w-full btn-secondary flex items-center justify-center gap-2 py-2.5"
        >
          <Save size={16} /> Save as Draft
        </button>
      </div>
    </div>
  );
};
