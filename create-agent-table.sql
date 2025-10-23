-- Create agent_usage table
CREATE TABLE IF NOT EXISTS agent_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  usage_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_agent_usage_user_date ON agent_usage(user_id, usage_date);

-- Enable RLS
ALTER TABLE agent_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own usage
CREATE POLICY "Users can view own agent usage" ON agent_usage 
FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth0_id = current_setting('app.current_user_auth0_id')));

CREATE POLICY "Users can insert own agent usage" ON agent_usage 
FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth0_id = current_setting('app.current_user_auth0_id')));
