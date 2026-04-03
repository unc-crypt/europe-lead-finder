
-- Drop the duplicate indexes
DROP INDEX IF EXISTS leads_email_unique;
DROP INDEX IF EXISTS leads_email_unique_idx;

-- Add a proper unique constraint on email column
ALTER TABLE public.leads ADD CONSTRAINT leads_email_key UNIQUE (email);
