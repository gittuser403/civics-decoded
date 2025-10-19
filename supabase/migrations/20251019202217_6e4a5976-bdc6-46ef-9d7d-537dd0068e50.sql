-- Fix security definer view issue - recreate as security invoker
DROP VIEW IF EXISTS public.sync_status;

CREATE VIEW public.sync_status
WITH (security_invoker = true)
AS
SELECT 
  source,
  COUNT(*) as total_syncs,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_syncs,
  MAX(completed_at) as last_sync_time
FROM sync_log
WHERE completed_at > NOW() - INTERVAL '7 days'
GROUP BY source;

GRANT SELECT ON public.sync_status TO authenticated, anon;

-- Add explicit deny policy to sync_log table to clarify security model
CREATE POLICY "Sync logs not directly accessible"
ON sync_log FOR SELECT
USING (false);

COMMENT ON POLICY "Sync logs not directly accessible" ON sync_log IS 'Sync logs are only accessible through the sync_status view which provides sanitized aggregate data.';