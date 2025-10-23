-- Drop existing trigger
DROP TRIGGER IF EXISTS check_user_channel_limit ON user_channels;
DROP FUNCTION IF EXISTS check_user_channel_limit() CASCADE;

-- Create new function that allows Channel Requests + 9 others
CREATE OR REPLACE FUNCTION check_user_channel_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    channel_count INTEGER;
    channel_requests_id UUID;
BEGIN
    -- Get user role
    SELECT role INTO user_role FROM users WHERE id = NEW.user_id;
    
    -- Only check limit for regular users, not admin/moderator
    IF user_role = 'user' THEN
        -- Get Channel Requests channel ID
        SELECT id INTO channel_requests_id FROM channels WHERE name = 'Channel Requests';
        
        -- Count channels excluding Channel Requests
        SELECT COUNT(*) INTO channel_count 
        FROM user_channels 
        WHERE user_id = NEW.user_id 
        AND channel_id != channel_requests_id;
        
        -- Allow Channel Requests + max 9 others = 10 total
        IF channel_count >= 9 AND NEW.channel_id != channel_requests_id THEN
            RAISE EXCEPTION 'User cannot join more than 9 channels (plus Channel Requests)';
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
