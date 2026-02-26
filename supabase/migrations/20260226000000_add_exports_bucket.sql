-- Create exports storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can upload their own exports (folder = user_id)
CREATE POLICY "Users can upload their own exports"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own exports"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own exports"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);
