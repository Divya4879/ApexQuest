-- Create the Channel Requests channel
INSERT INTO channels (id, name, description, emoji, status) 
VALUES (
  gen_random_uuid(),
  'Channel Requests',
  'Request new channels here. Communicate with admins and moderators about channel ideas.',
  '📝',
  'active'
) ON CONFLICT DO NOTHING;

-- Auto-join all existing users to this channel
INSERT INTO user_channels (user_id, channel_id)
SELECT u.id, c.id
FROM users u, channels c
WHERE c.name = 'Channel Requests'
AND NOT EXISTS (
  SELECT 1 FROM user_channels uc 
  WHERE uc.user_id = u.id AND uc.channel_id = c.id
);
