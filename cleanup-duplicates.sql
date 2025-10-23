-- Clean up duplicate replies (keep only the latest one for each duplicate)
WITH duplicate_replies AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY post_id, user_id, content, created_at::date 
           ORDER BY created_at DESC
         ) as rn
  FROM replies
)
DELETE FROM replies 
WHERE id IN (
  SELECT id FROM duplicate_replies WHERE rn > 1
);

-- Update replies count for all posts to match actual count
UPDATE posts 
SET replies_count = (
  SELECT COUNT(*) 
  FROM replies 
  WHERE replies.post_id = posts.id 
    AND replies.is_flagged = FALSE
);

-- Update likes count for all posts to match actual count  
UPDATE posts 
SET likes_count = (
  SELECT COUNT(*) 
  FROM likes 
  WHERE likes.post_id = posts.id
);
