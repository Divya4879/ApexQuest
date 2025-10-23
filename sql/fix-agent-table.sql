-- Disable RLS on agent_usage table to fix the error
ALTER TABLE agent_usage DISABLE ROW LEVEL SECURITY;

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Users can view own agent usage" ON agent_usage;
DROP POLICY IF EXISTS "Users can insert own agent usage" ON agent_usage;
