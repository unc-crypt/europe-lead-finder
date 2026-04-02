DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_email_unique') THEN
    ALTER TABLE public.leads DROP CONSTRAINT leads_email_unique;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS leads_email_unique_idx ON public.leads (email) WHERE email IS NOT NULL;