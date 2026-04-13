SELECT cron.schedule(
  'scrape-uk-leads-job',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1) || '/functions/v1/scrape-uk-leads',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('cycle_index', EXTRACT(EPOCH FROM now())::int / 120)
  );
  $$
);