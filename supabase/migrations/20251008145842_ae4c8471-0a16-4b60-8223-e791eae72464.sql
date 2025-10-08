-- Create bookmark folders table
CREATE TABLE public.bookmark_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create bookmarked episodes table
CREATE TABLE public.bookmarked_episodes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  episode_id uuid REFERENCES public.episodes(id) ON DELETE CASCADE NOT NULL,
  folder_id uuid REFERENCES public.bookmark_folders(id) ON DELETE SET NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, episode_id)
);

-- Create bookmarked lessons table
CREATE TABLE public.bookmarked_lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  folder_id uuid REFERENCES public.bookmark_folders(id) ON DELETE SET NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.bookmark_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarked_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarked_lessons ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (will add auth later)
CREATE POLICY "Public read access for bookmark_folders"
  ON public.bookmark_folders FOR SELECT USING (true);

CREATE POLICY "Public insert for bookmark_folders"
  ON public.bookmark_folders FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update for bookmark_folders"
  ON public.bookmark_folders FOR UPDATE USING (true);

CREATE POLICY "Public delete for bookmark_folders"
  ON public.bookmark_folders FOR DELETE USING (true);

CREATE POLICY "Public read access for bookmarked_episodes"
  ON public.bookmarked_episodes FOR SELECT USING (true);

CREATE POLICY "Public insert for bookmarked_episodes"
  ON public.bookmarked_episodes FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete for bookmarked_episodes"
  ON public.bookmarked_episodes FOR DELETE USING (true);

CREATE POLICY "Public read access for bookmarked_lessons"
  ON public.bookmarked_lessons FOR SELECT USING (true);

CREATE POLICY "Public insert for bookmarked_lessons"
  ON public.bookmarked_lessons FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete for bookmarked_lessons"
  ON public.bookmarked_lessons FOR DELETE USING (true);

-- Add triggers for updated_at on bookmark_folders
CREATE TRIGGER update_bookmark_folders_updated_at
  BEFORE UPDATE ON public.bookmark_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();