-- Add columns to bills table for arguments, stages, and impact data
ALTER TABLE bills ADD COLUMN IF NOT EXISTS arguments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS impact_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS cost_estimate TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS affected_population TEXT;

-- Create watchlist table for users to save bills they care about
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bill_id)
);

-- Enable RLS on watchlist
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Policies for watchlist (users can only see and modify their own)
CREATE POLICY "Users can view their own watchlist"
  ON watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watchlist"
  ON watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their watchlist"
  ON watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- Update existing bills with sample arguments, stages, and impact data
UPDATE bills SET 
  arguments = '[
    {"side": "for", "text": "Addresses a critical need in underserved communities", "source": "Policy Analysis Center"},
    {"side": "against", "text": "May increase federal spending without clear ROI metrics", "source": "Fiscal Responsibility Institute"},
    {"side": "for", "text": "Evidence-based approach supported by multiple studies", "source": "Research Foundation"},
    {"side": "against", "text": "Implementation timeline may be too aggressive", "source": "Government Accountability Office"}
  ]'::jsonb,
  stages = '[
    {"name": "Introduced", "status": "completed", "date": "2024-01-15"},
    {"name": "Committee Review", "status": "completed", "date": "2024-02-03"},
    {"name": "House Vote", "status": "current", "date": "Expected Mar 2024"},
    {"name": "Senate Vote", "status": "pending"},
    {"name": "Presidential Signature", "status": "pending"}
  ]'::jsonb,
  impact_data = '{
    "affected_population": "45 million students K-12",
    "cost_estimate": "$5 billion annually",
    "sectors": ["Education", "Public Health"],
    "geographic_scope": "All 50 states",
    "timeline": "5 years"
  }'::jsonb
WHERE bill_number = 'H.R. 1234';

UPDATE bills SET 
  arguments = '[
    {"side": "for", "text": "Critical investment in green technology and job creation", "source": "Environmental Policy Center"},
    {"side": "against", "text": "Tax credits may disproportionately benefit wealthy buyers", "source": "Economic Equity Institute"},
    {"side": "for", "text": "Reduces carbon emissions by estimated 30% over 10 years", "source": "Climate Research Institute"},
    {"side": "against", "text": "Electric vehicle infrastructure still insufficient in rural areas", "source": "Rural Development Council"}
  ]'::jsonb,
  stages = '[
    {"name": "Introduced", "status": "completed", "date": "2024-02-03"},
    {"name": "Committee Review", "status": "completed", "date": "2024-02-20"},
    {"name": "House Vote", "status": "completed", "date": "2024-03-05"},
    {"name": "Senate Vote", "status": "current", "date": "Expected Apr 2024"},
    {"name": "Presidential Signature", "status": "pending"}
  ]'::jsonb,
  impact_data = '{
    "affected_population": "All consumers, 150M+ drivers",
    "cost_estimate": "$10 billion over 5 years",
    "sectors": ["Energy", "Transportation", "Environment"],
    "geographic_scope": "National",
    "timeline": "5 years"
  }'::jsonb
WHERE bill_number = 'S. 567';