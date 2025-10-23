-- Create agent_usage table (ignore if exists)
CREATE TABLE IF NOT EXISTS agent_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  usage_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance (ignore if exists)
CREATE INDEX IF NOT EXISTS idx_agent_usage_user_date ON agent_usage(user_id, usage_date);
