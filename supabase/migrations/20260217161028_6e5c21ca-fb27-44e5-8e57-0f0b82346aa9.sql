
ALTER TABLE public.profiles
  ADD COLUMN website_url text,
  ADD COLUMN niche text,
  ADD COLUMN keywords text[] DEFAULT '{}'::text[];
