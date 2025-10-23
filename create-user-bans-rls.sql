-- Enable RLS on user_bans table
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (since we handle permissions in app logic)
CREATE POLICY "Allow all operations on user_bans for authenticated users" ON user_bans
FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: More specific policies if needed
-- CREATE POLICY "Users can view their own bans" ON user_bans
-- FOR SELECT USING (auth.uid()::text = user_id);

-- CREATE POLICY "Admins can manage all bans" ON user_bans
-- FOR ALL USING (true); -- Handle admin check in application
