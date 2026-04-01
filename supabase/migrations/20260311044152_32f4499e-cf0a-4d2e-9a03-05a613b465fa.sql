
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS category text DEFAULT '',
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS seo_title text DEFAULT '',
ADD COLUMN IF NOT EXISTS seo_description text DEFAULT '',
ADD COLUMN IF NOT EXISTS featured_image_url text DEFAULT '',
ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS platform_wordpress boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS platform_medium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS platform_status jsonb DEFAULT '{}'::jsonb;
