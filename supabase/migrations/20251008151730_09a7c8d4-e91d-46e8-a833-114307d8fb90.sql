-- Create enum for startup stages
CREATE TYPE public.startup_stage AS ENUM (
  'pre_seed',
  'seed',
  'series_a',
  'series_b_plus',
  'growth',
  'public',
  'bootstrapped'
);

-- Create user_startup_profiles table (limit 3 per user)
CREATE TABLE public.user_startup_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  stage public.startup_stage NOT NULL,
  funding_raised TEXT,
  valuation TEXT,
  employee_count INTEGER,
  industry TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_startup_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_startup_profiles
CREATE POLICY "Users can view their own profiles"
  ON public.user_startup_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profiles"
  ON public.user_startup_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
  ON public.user_startup_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles"
  ON public.user_startup_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create personalized_insights table
CREATE TABLE public.personalized_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  startup_profile_id UUID REFERENCES public.user_startup_profiles(id) ON DELETE CASCADE,
  personalized_text TEXT NOT NULL,
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
  action_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personalized_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personalized_insights
CREATE POLICY "Public read access for personalized_insights"
  ON public.personalized_insights
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert for personalized_insights"
  ON public.personalized_insights
  FOR INSERT
  WITH CHECK (true);

-- Add trigger for updated_at on user_startup_profiles
CREATE TRIGGER update_user_startup_profiles_updated_at
  BEFORE UPDATE ON public.user_startup_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();