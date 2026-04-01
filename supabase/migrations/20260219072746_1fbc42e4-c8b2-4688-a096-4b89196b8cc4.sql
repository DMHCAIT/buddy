
ALTER TABLE public.content_plans
  ADD CONSTRAINT content_plans_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.serp_analyses
  ADD CONSTRAINT serp_analyses_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
