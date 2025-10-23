-- Drop existing tables if they have conflicts
DROP TABLE IF EXISTS user_warnings CASCADE;
DROP TABLE IF EXISTS user_bans CASCADE;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel requests table
CREATE TABLE IF NOT EXISTS channel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User warnings table (fresh)
CREATE TABLE user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  warning_level INTEGER DEFAULT 1,
  reason TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User bans table (fresh)
CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ban_type TEXT DEFAULT 'temp',
  reason TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 day'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_new ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_requests_user_id_new ON channel_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_warnings_user_id_new ON user_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_user_id_new ON user_bans(user_id);
