-- Drop existing functions first
DROP FUNCTION IF EXISTS get_active_warnings(UUID);
DROP FUNCTION IF EXISTS is_user_banned(UUID);

-- Function to check active warnings (non-expired)
CREATE OR REPLACE FUNCTION get_active_warnings(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_warnings
    WHERE user_id = user_uuid
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_bans
    WHERE user_id = user_uuid
    AND (expires_at > NOW() OR ban_type = 'permanent')
  );
END;
$$ LANGUAGE plpgsql;
