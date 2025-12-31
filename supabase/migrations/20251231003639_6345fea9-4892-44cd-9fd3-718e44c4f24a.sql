-- Add role column to user_startup_profiles table
ALTER TABLE public.user_startup_profiles 
ADD COLUMN role text;