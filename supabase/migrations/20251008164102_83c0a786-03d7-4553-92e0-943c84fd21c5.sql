-- Add RLS policy to allow deleting episodes
CREATE POLICY "Public delete for episodes" 
ON public.episodes 
FOR DELETE 
USING (true);

-- Add cascading deletes to foreign keys
-- Drop and recreate foreign key constraints with ON DELETE CASCADE

-- lessons.episode_id -> episodes.id
ALTER TABLE public.lessons 
DROP CONSTRAINT IF EXISTS lessons_episode_id_fkey;

ALTER TABLE public.lessons 
ADD CONSTRAINT lessons_episode_id_fkey 
FOREIGN KEY (episode_id) 
REFERENCES public.episodes(id) 
ON DELETE CASCADE;

-- chavel_callouts.episode_id -> episodes.id
ALTER TABLE public.chavel_callouts 
DROP CONSTRAINT IF EXISTS chavel_callouts_episode_id_fkey;

ALTER TABLE public.chavel_callouts 
ADD CONSTRAINT chavel_callouts_episode_id_fkey 
FOREIGN KEY (episode_id) 
REFERENCES public.episodes(id) 
ON DELETE CASCADE;

-- bookmarked_episodes.episode_id -> episodes.id
ALTER TABLE public.bookmarked_episodes 
DROP CONSTRAINT IF EXISTS bookmarked_episodes_episode_id_fkey;

ALTER TABLE public.bookmarked_episodes 
ADD CONSTRAINT bookmarked_episodes_episode_id_fkey 
FOREIGN KEY (episode_id) 
REFERENCES public.episodes(id) 
ON DELETE CASCADE;

-- personalized_insights.lesson_id -> lessons.id
ALTER TABLE public.personalized_insights 
DROP CONSTRAINT IF EXISTS personalized_insights_lesson_id_fkey;

ALTER TABLE public.personalized_insights 
ADD CONSTRAINT personalized_insights_lesson_id_fkey 
FOREIGN KEY (lesson_id) 
REFERENCES public.lessons(id) 
ON DELETE CASCADE;