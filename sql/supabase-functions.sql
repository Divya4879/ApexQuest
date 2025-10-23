-- Create functions for updating post counts

-- Function to increment post likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post likes
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment post replies
CREATE OR REPLACE FUNCTION increment_post_replies(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET replies_count = replies_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post replies
CREATE OR REPLACE FUNCTION decrement_post_replies(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET replies_count = GREATEST(replies_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
