
-- Leads cache table
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apollo_id text UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  title text,
  company text,
  email text,
  phone text,
  country text,
  domain text,
  industry text,
  company_size text,
  seniority text,
  verified text DEFAULT 'unverified',
  confidence integer DEFAULT 50,
  linkedin_url text,
  raw_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for fast searches
CREATE INDEX idx_leads_domain ON public.leads(domain);
CREATE INDEX idx_leads_country ON public.leads(country);
CREATE INDEX idx_leads_industry ON public.leads(industry);
CREATE INDEX idx_leads_title ON public.leads USING gin(to_tsvector('english', coalesce(title, '')));
CREATE INDEX idx_leads_search ON public.leads USING gin(
  to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(title, '') || ' ' || coalesce(company, '') || ' ' || coalesce(email, '') || ' ' || coalesce(domain, ''))
);

-- Public read, service role write
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Service role can manage leads" ON public.leads FOR ALL USING (true);
