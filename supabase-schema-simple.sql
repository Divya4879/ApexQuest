-- ApexQuest Database Schema (Simplified)

-- Users table (extends Auth0 user data)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channels table (predefined channels)
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User channel memberships (max 10 channels per user)
CREATE TABLE user_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tag TEXT DEFAULT 'miscellaneous' CHECK (tag IN ('progress', 'challenges', 'wins', 'miscellaneous')),
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Replies table (nested up to 5 levels)
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  level INTEGER DEFAULT 1 CHECK (level <= 5),
  likes_count INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table (for posts and replies)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, reply_id),
  CHECK ((post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL))
);

-- Flags table (for moderation)
CREATE TABLE flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL))
);

-- Insert predefined channels
INSERT INTO channels (name, description, emoji) VALUES
('Fitness & Health', 'Workout progress, meal prep, wellness journey', '💪'),
('Learning & Skills', 'Coding, languages, certifications, new skills', '📚'),
('Creative Projects', 'Art, music, writing, creative endeavors', '🎨'),
('Career Growth', 'Job search, networking, promotions, professional development', '💼'),
('Financial Goals', 'Saving, investing, debt reduction, financial planning', '💰'),
('Relationships', 'Dating, family, friendships, social connections', '❤️'),
('Mental Health', 'Meditation, therapy, self-care, mindfulness', '🧠'),
('Home & Lifestyle', 'Organization, cooking, gardening, home improvement', '🏠'),
('Travel & Adventure', 'Trip planning, experiences, exploration', '✈️'),
('Entrepreneurship', 'Startup progress, side hustles, business building', '🚀');

-- Create indexes for performance
CREATE INDEX idx_posts_channel_id ON posts(channel_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_replies_post_id ON replies(post_id);
CREATE INDEX idx_replies_parent_reply_id ON replies(parent_reply_id);
CREATE INDEX idx_user_channels_user_id ON user_channels(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_reply_id ON likes(reply_id);

-- Function to check user channel limit (max 10)
CREATE OR REPLACE FUNCTION check_user_channel_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM user_channels WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'User cannot join more than 10 channels';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_channel_limit_trigger
  BEFORE INSERT ON user_channels
  FOR EACH ROW EXECUTE FUNCTION check_user_channel_limit();

-- Function to update reply level automatically
CREATE OR REPLACE FUNCTION set_reply_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_reply_id IS NULL THEN
    NEW.level = 1;
  ELSE
    SELECT level + 1 INTO NEW.level FROM replies WHERE id = NEW.parent_reply_id;
    IF NEW.level > 5 THEN
      RAISE EXCEPTION 'Reply nesting cannot exceed 5 levels';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reply_level_trigger
  BEFORE INSERT ON replies
  FOR EACH ROW EXECUTE FUNCTION set_reply_level();
