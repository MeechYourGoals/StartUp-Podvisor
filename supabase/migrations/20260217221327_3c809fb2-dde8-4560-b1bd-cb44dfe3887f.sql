
-- Add deck_url column to user_startup_profiles
ALTER TABLE public.user_startup_profiles ADD COLUMN IF NOT EXISTS deck_url text;

-- Create startup-decks storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('startup-decks', 'startup-decks', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can upload their own decks (folder = user_id)
CREATE POLICY "Users can upload their own decks"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'startup-decks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own decks"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'startup-decks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own decks"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'startup-decks' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create episode_folders table
CREATE TABLE public.episode_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#3b82f6',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.episode_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own episode folders"
ON public.episode_folders FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own episode folders"
ON public.episode_folders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episode folders"
ON public.episode_folders FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episode folders"
ON public.episode_folders FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create episode_folder_assignments table
CREATE TABLE public.episode_folder_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  episode_id uuid NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  folder_id uuid NOT NULL REFERENCES public.episode_folders(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, episode_id, folder_id)
);

ALTER TABLE public.episode_folder_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own folder assignments"
ON public.episode_folder_assignments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folder assignments"
ON public.episode_folder_assignments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folder assignments"
ON public.episode_folder_assignments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create user_subscriptions table (referenced by subscriptionService but doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  revenuecat_app_user_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Create user_monthly_usage table
CREATE TABLE IF NOT EXISTS public.user_monthly_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_year text NOT NULL,
  analyses_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

ALTER TABLE public.user_monthly_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
ON public.user_monthly_usage FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON public.user_monthly_usage FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON public.user_monthly_usage FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
