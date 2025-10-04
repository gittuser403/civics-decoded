-- Add new columns to bills table for live legislative feed
ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS external_id text,
ADD COLUMN IF NOT EXISTS last_synced timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS cosponsors jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS committees jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS votes jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS official_url text;

-- Create index on external_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_bills_external_id ON public.bills(external_id);

-- Create index on source for filtering
CREATE INDEX IF NOT EXISTS idx_bills_source ON public.bills(source);

-- Create index on last_synced for sync operations
CREATE INDEX IF NOT EXISTS idx_bills_last_synced ON public.bills(last_synced);

-- Create sync_log table to track API sync operations
CREATE TABLE IF NOT EXISTS public.sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  status text NOT NULL,
  bills_synced integer DEFAULT 0,
  error_message text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on sync_log
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view sync logs
CREATE POLICY "Sync logs are viewable by everyone" 
ON public.sync_log 
FOR SELECT 
USING (true);

-- Create index on sync_log for recent queries
CREATE INDEX IF NOT EXISTS idx_sync_log_created_at ON public.sync_log(created_at DESC);