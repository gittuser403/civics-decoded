-- Fix Bills Table RLS: Add explicit deny policies for write operations
-- This makes the security model clear - bills are read-only for users, only service role can write

CREATE POLICY "No direct inserts on bills"
ON bills FOR INSERT
WITH CHECK (false);

CREATE POLICY "No direct updates on bills"
ON bills FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct deletes on bills"
ON bills FOR DELETE
USING (false);

COMMENT ON TABLE bills IS 'Bills are synced from external sources via edge functions using service role key. Direct user modifications are not permitted.';

-- Fix Sync Log Exposure: Remove public access and create sanitized view

DROP POLICY IF EXISTS "Sync logs are viewable by everyone" ON sync_log;

CREATE VIEW public.sync_status AS
SELECT 
  source,
  COUNT(*) as total_syncs,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_syncs,
  MAX(completed_at) as last_sync_time
FROM sync_log
WHERE completed_at > NOW() - INTERVAL '7 days'
GROUP BY source;

COMMENT ON VIEW public.sync_status IS 'Public view providing sanitized aggregate sync information without exposing operational details.';

GRANT SELECT ON public.sync_status TO authenticated, anon;