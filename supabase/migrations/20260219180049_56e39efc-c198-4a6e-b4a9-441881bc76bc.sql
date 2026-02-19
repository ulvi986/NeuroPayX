
-- Create storage bucket for consultant photos
INSERT INTO storage.buckets (id, name, public) VALUES ('consultant-photos', 'consultant-photos', true);

-- Allow anyone to view consultant photos
CREATE POLICY "Anyone can view consultant photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'consultant-photos');

-- Allow authenticated users to upload consultant photos
CREATE POLICY "Authenticated users can upload consultant photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'consultant-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete consultant photos
CREATE POLICY "Authenticated users can delete consultant photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'consultant-photos' AND auth.role() = 'authenticated');
