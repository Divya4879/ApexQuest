-- Create post_flags table for flagging posts and replies
CREATE TABLE IF NOT EXISTS post_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL, -- Can be post ID or reply ID
  user_id UUID NOT NULL, -- User who flagged it
  reason TEXT DEFAULT 'Inappropriate content',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- Prevent duplicate flags from same user
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_flags_post_id ON post_flags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_flags_user_id ON post_flags(user_id);
