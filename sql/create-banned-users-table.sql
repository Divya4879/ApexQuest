-- Create banned_users table
CREATE TABLE IF NOT EXISTS banned_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  banned_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_banned_users_email ON banned_users(email);
CREATE INDEX IF NOT EXISTS idx_banned_users_expires_at ON banned_users(expires_at);

-- No RLS needed since we handle permissions in app
ALTER TABLE banned_users DISABLE ROW LEVEL SECURITY;
