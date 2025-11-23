-- Drop any existing policy first
DROP POLICY IF EXISTS "Authenticated users can upload template files" ON storage.objects;

-- Allow authenticated users to upload files to the 'templates' storage bucket
CREATE POLICY "Authenticated users can upload template files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'templates');