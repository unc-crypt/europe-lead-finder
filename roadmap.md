# Authentication and backend lockdown
- [x] Temporarily open preview pages and hide authentication controls; preserve production authentication and backend security. All four pages and skipped login/signup verified on mobile; 15 security/access tests pass.
- [x] Implement controlled email/password forms, recovery pages, session context, route protection, and sign-out.
- [x] Create private profiles and revoke frontend access to leads.
- [x] Enforce user/service-only access across all seven functions.
- [ ] Repair existing job credentials without changing schedules: blocked pending the user's scheduling-credential choice; current jobs use anon or empty vault references. The bound service credential also returned 401 against the deployed background gate.
- [x] Run security tests, verify signed-in/out flows and real recovery, and record exact changes. Email delivery to disposable test addresses was rejected; recovery-token flow passed.
