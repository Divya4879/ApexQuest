-- Remove foreign key constraint so post_flags can store both post IDs and reply IDs
ALTER TABLE post_flags DROP CONSTRAINT IF EXISTS post_flags_post_id_fkey;
