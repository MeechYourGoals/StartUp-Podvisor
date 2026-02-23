-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create lesson_tags join table
CREATE TABLE IF NOT EXISTS public.lesson_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(lesson_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags (readable by everyone, insertable by authenticated users)
CREATE POLICY "Enable read access for all users" ON public.tags
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for lesson_tags
CREATE POLICY "Enable read access for all users" ON public.lesson_tags
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.lesson_tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.lesson_tags
    FOR DELETE USING (auth.role() = 'authenticated');

-- Migrate existing categories to tags
INSERT INTO public.tags (name)
SELECT DISTINCT category
FROM public.lessons
WHERE category IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Link existing lessons to tags
INSERT INTO public.lesson_tags (lesson_id, tag_id)
SELECT l.id, t.id
FROM public.lessons l
JOIN public.tags t ON l.category = t.name
ON CONFLICT (lesson_id, tag_id) DO NOTHING;
