-- Drop any triggers or functions that enforce 10 channel limit
DROP TRIGGER IF EXISTS check_user_channel_limit ON user_channels;
DROP FUNCTION IF EXISTS check_user_channel_limit();

-- Remove any check constraints on user_channels table
ALTER TABLE user_channels DROP CONSTRAINT IF EXISTS user_channels_limit_check;

-- Create a new function that only limits regular users, not admin/moderator
CREATE OR REPLACE FUNCTION check_user_channel_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    channel_count INTEGER;
BEGIN
    -- Get user role
    SELECT role INTO user_role FROM users WHERE id = NEW.user_id;
    
    -- Only check limit for regular users
    IF user_role = 'user' THEN
        -- Count existing channels for this user
        SELECT COUNT(*) INTO channel_count 
        FROM user_channels 
        WHERE user_id = NEW.user_id;
        
        -- Check if adding this channel would exceed limit
        IF channel_count >= 10 THEN
            RAISE EXCEPTION 'User cannot join more than 10 channels';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that only applies to regular users
CREATE TRIGGER check_user_channel_limit
    BEFORE INSERT ON user_channels
    FOR EACH ROW
    EXECUTE FUNCTION check_user_channel_limit();
