-- Add channel_name column if it doesn't exist
ALTER TABLE channel_requests ADD COLUMN IF NOT EXISTS channel_name TEXT;

-- If the table has 'name' column instead, copy data over
UPDATE channel_requests SET channel_name = name WHERE channel_name IS NULL AND name IS NOT NULL;
