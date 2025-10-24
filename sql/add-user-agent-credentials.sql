-- Add Auth0 for AI Agents credentials to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS agent_client_id TEXT,
ADD COLUMN IF NOT EXISTS agent_client_secret TEXT;

-- Update existing users with user agent credentials
UPDATE users 
SET 
  agent_client_id = 'fTcLUweHWnDJysn1VczdXnNFZrhmQuLy',
  agent_client_secret = 'ZH1yqPW8HkAXboUIJYZo19bWPDYtfw7uQjzaCZ6mqvTU2GXGo-ml3kQBjnbW8mQa'
WHERE role = 'user' AND agent_client_id IS NULL;

-- Update moderators with mod agent credentials  
UPDATE users 
SET 
  agent_client_id = '2oLzK3zG5Wi4JZdOIdVaTvuErNR6qmxr',
  agent_client_secret = '-CzeIo-zyH6rqW1GYMyA10lnUTf1pd5RjBTzgLCjpuqZc648PQMgoTNgkL1d1k2y'
WHERE role = 'moderator' AND agent_client_id IS NULL;

-- Update admins with admin agent credentials
UPDATE users 
SET 
  agent_client_id = 'JgWsXm9GP699Dcf1z6qCcMQ0ICobWseS',
  agent_client_secret = 'lmn9GNHH1UO612cZY8KPpPVYM6ceKL8WqB_yEdA36SImiLMHVPDhnFRDczsQxYtt'
WHERE role = 'admin' AND agent_client_id IS NULL;
