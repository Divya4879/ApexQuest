-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'profile-pictures', 
  'profile-pictures', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Disable RLS on storage.objects for this bucket
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled but allow everything for profile-pictures:
-- DROP ALL existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- Create one simple policy that allows everything for profile-pictures bucket
CREATE POLICY "Allow all operations on profile-pictures" ON storage.objects
FOR ALL USING (bucket_id = 'profile-pictures')
WITH CHECK (bucket_id = 'profile-pictures');
