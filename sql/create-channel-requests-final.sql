-- Create channel_requests table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_channel_requests_user_id_final ON channel_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_requests_status_final ON channel_requests(status);
