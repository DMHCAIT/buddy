export type ContentItem = {
  day: number;
  title: string;
  type: string;
  keyword: string;
  description: string;
  long_tail_keyword?: string;
};

export const TYPE_COLORS: Record<string, string> = {
  blog: "bg-primary/10 text-primary",
  listicle: "bg-accent text-accent-foreground",
  "how-to": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "case-study": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  opinion: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};
