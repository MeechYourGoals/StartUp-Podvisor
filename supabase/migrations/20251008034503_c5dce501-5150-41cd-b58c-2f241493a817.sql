-- Create podcasts table
CREATE TABLE public.podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  founding_year INTEGER,
  current_stage TEXT,
  funding_raised TEXT,
  valuation TEXT,
  employee_count INTEGER,
  industry TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create episodes table
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  release_date DATE,
  url TEXT NOT NULL,
  platform TEXT DEFAULT 'YouTube',
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  founder_names TEXT,
  analysis_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  lesson_text TEXT NOT NULL,
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
  actionability_score INTEGER CHECK (actionability_score >= 1 AND actionability_score <= 10),
  category TEXT,
  founder_attribution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chavel_callouts table (relevant to user's startup)
CREATE TABLE public.chavel_callouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  callout_text TEXT NOT NULL,
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chavel_callouts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (this is a research tool)
CREATE POLICY "Public read access for podcasts" ON public.podcasts FOR SELECT USING (true);
CREATE POLICY "Public read access for companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Public read access for episodes" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Public read access for lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Public read access for chavel_callouts" ON public.chavel_callouts FOR SELECT USING (true);

-- For now, allow public insert/update for demo purposes (in production, restrict to authenticated users)
CREATE POLICY "Public insert for podcasts" ON public.podcasts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert for companies" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert for episodes" ON public.episodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert for lessons" ON public.lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert for chavel_callouts" ON public.chavel_callouts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update for episodes" ON public.episodes FOR UPDATE USING (true);

-- Create update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON public.podcasts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_episodes_podcast_id ON public.episodes(podcast_id);
CREATE INDEX idx_episodes_company_id ON public.episodes(company_id);
CREATE INDEX idx_lessons_episode_id ON public.lessons(episode_id);
CREATE INDEX idx_callouts_episode_id ON public.chavel_callouts(episode_id);