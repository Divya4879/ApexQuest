-- Disable RLS on user_bans table
ALTER TABLE user_bans DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow insert on user_bans for authenticated users" ON user_bans;
DROP POLICY IF EXISTS "Allow select on user_bans for authenticated users" ON user_bans;
DROP POLICY IF EXISTS "Allow update on user_bans for authenticated users" ON user_bans;
