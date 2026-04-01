-- Add indexes for better query performance on serp_analyses table

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_serp_analyses_user_id 
ON public.serp_analyses(user_id);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_serp_analyses_created_at 
ON public.serp_analyses(created_at DESC);

-- Composite index for user + date queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_serp_analyses_user_created 
ON public.serp_analyses(user_id, created_at DESC);

-- Index for niche-based searches
CREATE INDEX IF NOT EXISTS idx_serp_analyses_niche 
ON public.serp_analyses(niche);

-- GIN index for JSONB analysis data (for advanced queries)
CREATE INDEX IF NOT EXISTS idx_serp_analyses_analysis_gin 
ON public.serp_analyses USING gin(analysis);

-- Add metadata columns for better tracking
ALTER TABLE public.serp_analyses 
ADD COLUMN IF NOT EXISTS keywords_count INTEGER GENERATED ALWAYS AS (array_length(keywords, 1)) STORED;

ALTER TABLE public.serp_analyses 
ADD COLUMN IF NOT EXISTS analysis_version VARCHAR(10) DEFAULT 'v1.0';

-- Create a materialized view for analytics (optional - for advanced users)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.serp_analysis_stats AS
SELECT 
  user_id,
  COUNT(*) as total_analyses,
  COUNT(DISTINCT niche) as unique_niches,
  AVG(keywords_count) as avg_keywords_per_analysis,
  MAX(created_at) as last_analysis_date,
  MIN(created_at) as first_analysis_date
FROM public.serp_analyses
GROUP BY user_id;

-- Index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_serp_stats_user 
ON public.serp_analysis_stats(user_id);

-- Function to refresh stats (call this periodically or on trigger)
CREATE OR REPLACE FUNCTION refresh_serp_analysis_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.serp_analysis_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON TABLE public.serp_analyses IS 'Stores SEO/SERP analysis results with competitive intelligence data';
COMMENT ON INDEX idx_serp_analyses_user_created IS 'Optimizes common query pattern: user analyses sorted by date';
