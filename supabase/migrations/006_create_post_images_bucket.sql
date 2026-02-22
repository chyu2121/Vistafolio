-- Storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Users can update own post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images');

CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images');
