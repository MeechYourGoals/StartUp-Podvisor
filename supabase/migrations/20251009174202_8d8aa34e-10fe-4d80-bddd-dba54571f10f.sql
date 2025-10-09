-- First, delete any bookmarks with null user_id (orphaned data)
DELETE FROM bookmarked_episodes WHERE user_id IS NULL;
DELETE FROM bookmarked_lessons WHERE user_id IS NULL;

-- Now enforce NOT NULL constraints
ALTER TABLE bookmarked_episodes 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE bookmarked_lessons 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE bookmark_folders
  ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint to prevent duplicate bookmarks in same folder
ALTER TABLE bookmarked_episodes
  ADD CONSTRAINT unique_episode_folder 
  UNIQUE (episode_id, folder_id, user_id);

-- Create indexes for faster folder queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_folder ON bookmarked_episodes(folder_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarked_episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_user ON bookmark_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarked_lessons_folder ON bookmarked_lessons(folder_id);
CREATE INDEX IF NOT EXISTS idx_bookmarked_lessons_user ON bookmarked_lessons(user_id);

-- Update RLS policies for bookmarked_episodes to require authentication
DROP POLICY IF EXISTS "Public delete for bookmarked_episodes" ON public.bookmarked_episodes;
DROP POLICY IF EXISTS "Public insert for bookmarked_episodes" ON public.bookmarked_episodes;
DROP POLICY IF EXISTS "Public read access for bookmarked_episodes" ON public.bookmarked_episodes;

CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarked_episodes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.bookmarked_episodes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
ON public.bookmarked_episodes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarked_episodes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Update RLS policies for bookmarked_lessons to require authentication
DROP POLICY IF EXISTS "Public delete for bookmarked_lessons" ON public.bookmarked_lessons;
DROP POLICY IF EXISTS "Public insert for bookmarked_lessons" ON public.bookmarked_lessons;
DROP POLICY IF EXISTS "Public read access for bookmarked_lessons" ON public.bookmarked_lessons;

CREATE POLICY "Users can view their own bookmarked lessons"
ON public.bookmarked_lessons
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarked lessons"
ON public.bookmarked_lessons
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarked lessons"
ON public.bookmarked_lessons
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarked lessons"
ON public.bookmarked_lessons
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);