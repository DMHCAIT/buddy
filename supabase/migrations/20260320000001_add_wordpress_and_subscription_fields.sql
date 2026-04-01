-- Add WordPress integration fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wp_url text DEFAULT '',
ADD COLUMN IF NOT EXISTS wp_username text DEFAULT '',
ADD COLUMN IF NOT EXISTS wp_app_password text DEFAULT '';

-- Add subscription and billing fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text DEFAULT '',
ADD COLUMN IF NOT EXISTS stripe_subscription_id text DEFAULT '',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS posts_quota_monthly integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS posts_used_this_month integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS quota_reset_date timestamp with time zone DEFAULT date_trunc('month', now() + interval '1 month');

-- Add notification preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"post_published": true, "review_needed": true, "scheduled_reminder": true, "weekly_digest": true}'::jsonb;

-- Add onboarding tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;

-- Create subscriptions table for detailed billing tracking
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create publishing_logs table for tracking automated publishing
CREATE TABLE IF NOT EXISTS public.publishing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  status text NOT NULL,
  message text,
  response_data jsonb,
  published_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on publishing_logs
ALTER TABLE public.publishing_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view logs for their own posts" ON public.publishing_logs;

-- Policies for publishing_logs
CREATE POLICY "Users can view logs for their own posts"
ON public.publishing_logs FOR SELECT
USING (
  post_id IN (
    SELECT id FROM public.blog_posts WHERE user_id = auth.uid()
  )
);

-- Function to reset monthly quota
CREATE OR REPLACE FUNCTION reset_monthly_quota()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    posts_used_this_month = 0,
    quota_reset_date = date_trunc('month', now() + interval '1 month')
  WHERE quota_reset_date <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and increment quota
CREATE OR REPLACE FUNCTION check_and_increment_quota(p_user_id UUID)
RETURNS boolean AS $$
DECLARE
  v_quota integer;
  v_used integer;
  v_tier text;
BEGIN
  -- Get current quota info
  SELECT posts_quota_monthly, posts_used_this_month, subscription_tier
  INTO v_quota, v_used, v_tier
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Enterprise has unlimited
  IF v_tier = 'enterprise' THEN
    UPDATE public.profiles
    SET posts_used_this_month = posts_used_this_month + 1
    WHERE user_id = p_user_id;
    RETURN true;
  END IF;
  
  -- Check if under quota
  IF v_used < v_quota THEN
    UPDATE public.profiles
    SET posts_used_this_month = posts_used_this_month + 1
    WHERE user_id = p_user_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
