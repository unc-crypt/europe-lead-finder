# Architecture rules
- Keep session state in AuthProvider, register the auth listener before loading the session, and validate restored identity with getUser; protected routes must wait for resolution.
- Centralize edge authorization in functions/_shared: search endpoints validate user identity, background endpoints accept only the service-role credential; perform checks after preflight and before any work.
- Leads are service-only data; browser access must use an authenticated edge function, while profiles use owner-only RLS.
