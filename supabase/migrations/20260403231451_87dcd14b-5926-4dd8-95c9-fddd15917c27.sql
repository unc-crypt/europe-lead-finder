-- Composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_leads_country_industry ON public.leads (country, industry);
CREATE INDEX IF NOT EXISTS idx_leads_country_title ON public.leads (country, title);
CREATE INDEX IF NOT EXISTS idx_leads_domain_country ON public.leads (domain, country);
CREATE INDEX IF NOT EXISTS idx_leads_seniority_country ON public.leads (seniority, country);
CREATE INDEX IF NOT EXISTS idx_leads_country_company ON public.leads (country, company);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);

-- GIN index for full-text search on name and company
CREATE INDEX IF NOT EXISTS idx_leads_search ON public.leads USING gin (
  to_tsvector('simple', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(company, '') || ' ' || coalesce(title, ''))
);