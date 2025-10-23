-- Create function to decrement post replies count
CREATE OR REPLACE FUNCTION decrement_post_replies(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET replies_count = GREATEST(replies_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
