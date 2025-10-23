-- Fix banned_users table RLS
ALTER TABLE banned_users DISABLE ROW LEVEL SECURITY;

-- Fix notifications table RLS  
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
