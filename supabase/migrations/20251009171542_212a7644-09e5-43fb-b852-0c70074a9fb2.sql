-- Restrict bookmark_folders RLS policies to access owners only

-- Drop the overly permissive public policies
DROP POLICY IF EXISTS "Public read access for bookmark_folders" ON public.bookmark_folders;
DROP POLICY IF EXISTS "Public insert for bookmark_folders" ON public.bookmark_folders;
DROP POLICY IF EXISTS "Public update for bookmark_folders" ON public.bookmark_folders;
DROP POLICY IF EXISTS "Public delete for bookmark_folders" ON public.bookmark_folders;

-- Create secure policies that only allow users to access their own folders
CREATE POLICY "Users can view their own bookmark folders"
ON public.bookmark_folders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmark folders"
ON public.bookmark_folders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmark folders"
ON public.bookmark_folders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmark folders"
ON public.bookmark_folders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
