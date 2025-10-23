-- Extended ApexQuest Database Schema for Agent, Moderation, and Advanced Features

-- Add new columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_warning_at TIMESTAMP WITH TIME ZONE;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reply', 'like', 'warning', 'channel_request', 'channel_deleted', 'ban')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User warnings table
CREATE TABLE IF NOT EXISTS user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('post', 'reply')),
  content_id UUID,
  warning_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel requests table
CREATE TABLE IF NOT EXISTS channel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  votes_count INTEGER DEFAULT 0,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel request votes table
CREATE TABLE IF NOT EXISTS channel_request_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES channel_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id, user_id)
);

-- Admin messages table (for mod-to-admin communication)
CREATE TABLE IF NOT EXISTS admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  escalation_data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent usage tracking table
CREATE TABLE IF NOT EXISTS agent_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  usage_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel deletion queue table
CREATE TABLE IF NOT EXISTS channel_deletion_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  scheduled_deletion_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add pending_deletion status to channels
ALTER TABLE channels ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_deletion'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_warnings_user_id ON user_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_requests_status ON channel_requests(status);
CREATE INDEX IF NOT EXISTS idx_channel_request_votes_request_id ON channel_request_votes(request_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_to_user_id ON admin_messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_is_read ON admin_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_agent_usage_user_date ON agent_usage(user_id, usage_date);

-- Function to check daily agent usage limit
CREATE OR REPLACE FUNCTION check_agent_usage_limit(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO usage_count
  FROM agent_usage
  WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
  
  RETURN usage_count;
END;
$$ LANGUAGE plpgsql;

-- Function to increment warning count
CREATE OR REPLACE FUNCTION increment_user_warnings(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_warning_count INTEGER;
BEGIN
  UPDATE users 
  SET warning_count = warning_count + 1,
      last_warning_at = NOW()
  WHERE id = p_user_id
  RETURNING warning_count INTO new_warning_count;
  
  RETURN new_warning_count;
END;
$$ LANGUAGE plpgsql;

-- Function to reset warnings after 30 days
CREATE OR REPLACE FUNCTION reset_expired_warnings()
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET warning_count = 0,
      last_warning_at = NULL
  WHERE last_warning_at < NOW() - INTERVAL '30 days'
    AND warning_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-delete channels after 24 hours
CREATE OR REPLACE FUNCTION process_channel_deletions()
RETURNS VOID AS $$
DECLARE
  deletion_record RECORD;
BEGIN
  FOR deletion_record IN 
    SELECT cdq.*, c.name as channel_name
    FROM channel_deletion_queue cdq
    JOIN channels c ON cdq.channel_id = c.id
    WHERE cdq.scheduled_deletion_at <= NOW()
  LOOP
    -- Delete all posts in the channel
    DELETE FROM posts WHERE channel_id = deletion_record.channel_id;
    
    -- Delete user channel memberships
    DELETE FROM user_channels WHERE channel_id = deletion_record.channel_id;
    
    -- Delete the channel
    DELETE FROM channels WHERE id = deletion_record.channel_id;
    
    -- Remove from deletion queue
    DELETE FROM channel_deletion_queue WHERE id = deletion_record.id;
    
    -- Notify users (this would be handled by the application)
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT DISTINCT uc.user_id, 'channel_deleted', 
           'Channel Deleted', 
           'The channel "' || deletion_record.channel_name || '" has been deleted.',
           jsonb_build_object('channel_name', deletion_record.channel_name, 'reason', deletion_record.reason)
    FROM user_channels uc 
    WHERE uc.channel_id = deletion_record.channel_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for profile pictures (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- RLS Policies for new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_request_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_deletion_queue ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth0_id = current_setting('app.current_user_auth0_id')));
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth0_id = current_setting('app.current_user_auth0_id')));

-- Channel requests policies
CREATE POLICY "Users can view all channel requests" ON channel_requests FOR SELECT USING (true);
CREATE POLICY "Users can create channel requests" ON channel_requests FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth0_id = current_setting('app.current_user_auth0_id')));
CREATE POLICY "Admins can update channel requests" ON channel_requests FOR UPDATE USING ((SELECT role FROM users WHERE auth0_id = current_setting('app.current_user_auth0_id')) = 'admin');

-- Agent usage policies
CREATE POLICY "Users can view own agent usage" ON agent_usage FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth0_id = current_setting('app.current_user_auth0_id')));
CREATE POLICY "Users can insert own agent usage" ON agent_usage FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth0_id = current_setting('app.current_user_auth0_id')));
