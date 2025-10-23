-- Add missing user_id column to post_flags table
ALTER TABLE post_flags ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add reason column if it doesn't exist
ALTER TABLE post_flags ADD COLUMN IF NOT EXISTS reason TEXT DEFAULT 'Inappropriate content';

-- Create unique constraint to prevent duplicate flags
ALTER TABLE post_flags ADD CONSTRAINT IF NOT EXISTS unique_post_user_flag UNIQUE(post_id, user_id);
