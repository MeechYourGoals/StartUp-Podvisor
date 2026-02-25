
-- Create tags table
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create lesson_tags junction table
CREATE TABLE public.lesson_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_tags ENABLE ROW LEVEL SECURITY;

-- Tags are publicly readable and insertable (used by analysis)
CREATE POLICY "Public read access for tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public insert for tags" ON public.tags FOR INSERT WITH CHECK (true);

-- Lesson tags are publicly readable and insertable
CREATE POLICY "Public read access for lesson_tags" ON public.lesson_tags FOR SELECT USING (true);
CREATE POLICY "Public insert for lesson_tags" ON public.lesson_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete for lesson_tags" ON public.lesson_tags FOR DELETE USING (true);
