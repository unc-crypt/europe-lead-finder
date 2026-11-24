import { createClient } from "npm:@supabase/supabase-js@2";
import { isServiceAuthorized, isUserAuthorized } from "./access.ts";

export async function authorizeRequest(req: Request, mode: "user" | "service", corsHeaders: Record<string, string>): Promise<Response | null> {
  const header = req.headers.get("Authorization");
  let allowed = false;
  if (mode === "service") {
    allowed = isServiceAuthorized(header, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  } else {
    allowed = await isUserAuthorized(header, async (token) => {
      const url = Deno.env.get("SUPABASE_URL");
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
      if (!url || !anonKey) return false;
      const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data, error } = await client.auth.getUser(token);
      return !error && !!data.user && !data.user.is_anonymous;
    });
  }
  return allowed ? null : new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
