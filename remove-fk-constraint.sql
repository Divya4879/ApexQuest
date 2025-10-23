-- Remove foreign key constraint from user_warnings table
ALTER TABLE user_warnings DROP CONSTRAINT IF EXISTS user_warnings_post_id_fkey;
