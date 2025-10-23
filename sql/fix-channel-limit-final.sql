-- Drop the existing trigger first
DROP TRIGGER IF EXISTS user_channel_limit_trigger ON user_channels;
DROP TRIGGER IF EXISTS check_user_channel_limit ON user_channels;

-- Now drop the function
DROP FUNCTION IF EXISTS check_user_channel_limit() CASCADE;

-- Create new function that allows unlimited channels for admin/moderator
CREATE OR REPLACE FUNCTION check_user_channel_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    channel_count INTEGER;
BEGIN
    -- Get user role
    SELECT role INTO user_role FROM users WHERE id = NEW.user_id;
    
    -- Only check limit for regular users, not admin/moderator
    IF user_role = 'user' THEN
        SELECT COUNT(*) INTO channel_count 
        FROM user_channels 
        WHERE user_id = NEW.user_id;
        
        IF channel_count >= 10 THEN
            RAISE EXCEPTION 'User cannot join more than 10 channels';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER check_user_channel_limit
    BEFORE INSERT ON user_channels
    FOR EACH ROW
    EXECUTE FUNCTION check_user_channel_limit();
