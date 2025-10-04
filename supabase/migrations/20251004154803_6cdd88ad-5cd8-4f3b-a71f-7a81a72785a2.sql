-- Create bills table with pre-loaded legislation
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number TEXT NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_text TEXT NOT NULL,
  status TEXT NOT NULL,
  introduced_date DATE NOT NULL,
  category TEXT NOT NULL,
  sponsor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read bills (public data)
CREATE POLICY "Bills are viewable by everyone" 
ON public.bills 
FOR SELECT 
USING (true);

-- Insert some sample bills for users to explore
INSERT INTO public.bills (bill_number, title, short_description, full_text, status, introduced_date, category, sponsor) VALUES
(
  'H.R. 1234',
  'School Lunch Improvement Act',
  'Increases funding for school lunch programs and ensures all students receive free breakfast and lunch.',
  'This bill provides $5 billion annually to ensure all K-12 students receive free breakfast and lunch at school. It also updates nutritional standards and provides grants for schools to upgrade kitchen facilities.',
  'Committee Review',
  '2024-01-15',
  'Education',
  'Rep. Maria Garcia (D-CA)'
),
(
  'S. 567',
  'Clean Energy Innovation Act',
  'Invests in renewable energy research and provides tax credits for clean energy adoption.',
  'This legislation allocates $10 billion over 5 years for renewable energy research, provides tax credits up to $7,500 for electric vehicle purchases, and creates grants for solar panel installation in low-income communities.',
  'Senate Vote',
  '2024-02-03',
  'Environment',
  'Sen. James Thompson (I-VT)'
),
(
  'H.R. 2890',
  'Student Debt Relief Act',
  'Forgives up to $20,000 in student loan debt and caps interest rates at 2%.',
  'This bill forgives $10,000 in federal student loan debt for all borrowers and an additional $10,000 for Pell Grant recipients. It also permanently caps interest rates at 2% and creates an income-based repayment plan.',
  'House Vote',
  '2023-11-20',
  'Education',
  'Rep. Alexandra Chen (D-NY)'
),
(
  'S. 789',
  'Rural Internet Access Act',
  'Expands high-speed internet infrastructure to rural and underserved communities.',
  'Provides $12 billion in grants to telecom companies and local governments to build fiber optic networks in rural areas. Ensures every American has access to internet speeds of at least 100 Mbps by 2028.',
  'Passed Senate',
  '2024-01-28',
  'Technology',
  'Sen. Robert Williams (R-MT)'
),
(
  'H.R. 3456',
  'Mental Health in Schools Act',
  'Funds mental health counselors and support services in public schools.',
  'Allocates $3 billion annually for schools to hire licensed mental health counselors, with a goal of one counselor per 250 students. Also provides training for teachers to recognize mental health challenges.',
  'Committee Review',
  '2024-02-10',
  'Education',
  'Rep. David Martinez (D-TX)'
);