
-- Create table to store SERP analysis results
CREATE TABLE public.serp_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  niche TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}'::text[],
  analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.serp_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SERP analyses"
ON public.serp_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SERP analyses"
ON public.serp_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SERP analyses"
ON public.serp_analyses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SERP analyses"
ON public.serp_analyses FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_serp_analyses_updated_at
BEFORE UPDATE ON public.serp_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
