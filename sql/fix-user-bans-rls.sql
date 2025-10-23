-- Drop existing policy and create new ones
DROP POLICY IF EXISTS "Allow all operations on user_bans for authenticated users" ON user_bans;

-- Allow authenticated users to insert bans
CREATE POLICY "Allow insert on user_bans for authenticated users" ON user_bans
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to select bans
CREATE POLICY "Allow select on user_bans for authenticated users" ON user_bans
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to update bans (for unban functionality)
CREATE POLICY "Allow update on user_bans for authenticated users" ON user_bans
FOR UPDATE USING (auth.role() = 'authenticated');
