-- Drop and recreate user_bans table without RLS issues
DROP TABLE IF EXISTS user_bans CASCADE;

CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX idx_user_bans_expires_at ON user_bans(expires_at);

-- Explicitly disable RLS
ALTER TABLE user_bans DISABLE ROW LEVEL SECURITY;
