
-- Create content_plans table to store generated plans
CREATE TABLE public.content_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  niche TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}'::text[],
  long_tail_keywords TEXT[] NOT NULL DEFAULT '{}'::text[],
  days INTEGER NOT NULL DEFAULT 30,
  tone TEXT NOT NULL DEFAULT 'professional',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own plans"
ON public.content_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans"
ON public.content_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
ON public.content_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
ON public.content_plans FOR DELETE
USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_content_plans_updated_at
BEFORE UPDATE ON public.content_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
