# Authentication and backend lockdown

## Implemented and verified
- Real email/password signup and login, required names, valid email, minimum eight-character password, loading states and error toasts.
- Email confirmation stays enabled; anonymous signup stays disabled.
- Session-aware protection of dashboard, lists, credits and settings; signed-in login/signup visits redirect to dashboard.
- Sign-out on desktop and mobile; landing navigation shows Dashboard for signed-in users. Landing layout, imagery and scraper logic are unchanged.
- Password reset request page and public recovery page. A real recovery token updated the password, and the new password signed in successfully. Delivery to disposable test addresses was rejected and showed a clear error; actual inbox delivery remains unverified.
- Signup created a profile with the submitted names and company. Browser reads of leads were denied.
- All seven deployed functions returned 401 for missing, invalid and anon credentials; all five background functions also rejected normal signed-in tokens. CORS preflights passed.
- Signed-in dashboard search returned existing lead rows through scrape-leads.
- Thirteen retained validation/access-rule and route-protection tests passed. Latest preview check: build OK.

## Outstanding scheduling blocker
Existing jobs do not have the credentials described in the request: bulk-scrape-leads uses an anon bearer; discover-emails-job, scrape-directories-job and scrape-uk-leads-job reference an empty credential vault. Their schedules and commands were not changed. They are blocked by the strict new service-only gates.

Managed service credentials were rebound, but a service-credential probe against deployed pdl-import still returned 401. No secrets were exposed or embedded in source. Managed scheduling authentication was provisioned; its generated helper is unused pending the user's decision whether to allow that private scheduling credential instead. Background functions currently remain exactly service-role-only in code.

## Exact application files
Modified:
- src/App.tsx
- src/components/Navbar.tsx
- src/pages/Login.tsx
- src/pages/Signup.tsx
- src/integrations/supabase/types.ts (automatically regenerated)
- supabase/functions/scrape-leads/index.ts
- supabase/functions/search-leads/index.ts
- supabase/functions/bulk-scrape/index.ts
- supabase/functions/discover-emails/index.ts
- supabase/functions/scrape-directories/index.ts
- supabase/functions/scrape-uk-leads/index.ts
- supabase/functions/pdl-import/index.ts

Added:
- src/contexts/AuthContext.tsx
- src/components/ProtectedRoute.tsx
- src/lib/auth-validation.ts
- src/pages/ForgotPassword.tsx
- src/pages/ResetPassword.tsx
- src/test/auth-security.test.ts
- src/test/protected-route.test.tsx
- supabase/functions/_shared/access.ts
- supabase/functions/_shared/auth.ts
- supabase/functions/_shared/cron-auth.ts (platform generated, not used)
- AGENTS.md
- roadmap.md
- .lovable/reviews/auth-lockdown.md

Migration-tool generated files:
- drizzle.config.ts
- drizzle/schema.ts
- drizzle/migrations/0000_profiles_and_private_leads.sql
- drizzle/migrations/meta/0000_snapshot.json
- drizzle/migrations/meta/_journal.json
- package.json and bun.lock (migration dependencies)

## Exact database and auth changes
- public.profiles table, with first_name, last_name, company, created_at and updated_at; primary-key foreign key to auth.users with cascading deletion and input length constraints.
- profiles owner-only SELECT and UPDATE policies: "Users can read own profile", "Users can update own profile". Authenticated users have SELECT/UPDATE; service role has full access; anon has none.
- public.create_signup_profile() and auth.users trigger on_auth_user_create_profile, creating profiles from signup metadata.
- public.touch_profile_updated_at() and profiles trigger profiles_updated_at.
- public.leads RLS remains enabled; removed "Anyone can read leads" and the three old public-targeted service-write policies. Revoked all privileges from PUBLIC, anon and authenticated; retained full service-role privileges. No replacement leads policies were added.
- Lovable Cloud email/password enabled (already enabled), email confirmation explicitly kept on, anonymous signup explicitly disabled.
- No changes to supabase/config.toml; in-code authorization runs after OPTIONS and before scraper/provider/database work.
- No changes to job schedules or commands.