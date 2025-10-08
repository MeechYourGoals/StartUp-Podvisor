-- Add cascading deletes for episode-related tables

-- Ensure lessons are deleted when episode is deleted
ALTER TABLE lessons
DROP CONSTRAINT IF EXISTS lessons_episode_id_fkey,
ADD CONSTRAINT lessons_episode_id_fkey 
  FOREIGN KEY (episode_id) 
  REFERENCES episodes(id) 
  ON DELETE CASCADE;

-- Ensure chavel_callouts are deleted when episode is deleted
ALTER TABLE chavel_callouts
DROP CONSTRAINT IF EXISTS chavel_callouts_episode_id_fkey,
ADD CONSTRAINT chavel_callouts_episode_id_fkey 
  FOREIGN KEY (episode_id) 
  REFERENCES episodes(id) 
  ON DELETE CASCADE;

-- Ensure bookmarked_episodes are deleted when episode is deleted
ALTER TABLE bookmarked_episodes
DROP CONSTRAINT IF EXISTS bookmarked_episodes_episode_id_fkey,
ADD CONSTRAINT bookmarked_episodes_episode_id_fkey 
  FOREIGN KEY (episode_id) 
  REFERENCES episodes(id) 
  ON DELETE CASCADE;

-- Ensure personalized_insights are deleted when lesson is deleted
ALTER TABLE personalized_insights
DROP CONSTRAINT IF EXISTS personalized_insights_lesson_id_fkey,
ADD CONSTRAINT personalized_insights_lesson_id_fkey 
  FOREIGN KEY (lesson_id) 
  REFERENCES lessons(id) 
  ON DELETE CASCADE;