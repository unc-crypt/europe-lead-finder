import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// People Data Labs API - 3B+ person profiles
const PDL_BASE = "https://api.peopledatalabs.com/v5";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PDL_API_KEY = Deno.env.get("PDL_API_KEY");
    if (!PDL_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "People Data Labs API key not configured. Get one at https://peopledatalabs.com (free tier: 100 records/month)",
          setup_url: "https://peopledatalabs.com" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { 
      role, country, domain, industry,
      page_size = 100, 
      scroll_token,
      mode = "search" // "search" or "enrich"
    } = body;

    if (mode === "search") {
      // Build PDL search query
      const query: any = {
        size: Math.min(page_size, 100),
      };

      // Build Elasticsearch query for PDL
      const must: any[] = [];
      
      if (country) {
        must.push({ term: { "location_country": country.toLowerCase() } });
      }
      if (role) {
        must.push({ match: { "job_title": role } });
      }
      if (industry) {
        must.push({ match: { "industry": industry } });
      }
      if (domain) {
        must.push({ 
          bool: {
            should: [
              { term: { "personal_emails": `@${domain}` } },
              { wildcard: { "work_email": `*@${domain}` } },
            ]
          }
        });
      }

      // Focus on Europe if no country specified
      if (!country) {
        must.push({
          terms: {
            "location_country": [
              "germany", "france", "italy", "spain", "netherlands", "poland",
              "bulgaria", "czech republic", "romania", "austria", "sweden",
              "belgium", "portugal", "switzerland", "denmark", "norway",
              "finland", "ireland", "greece", "hungary", "croatia",
              "united kingdom", "slovakia", "slovenia", "lithuania", "latvia",
              "estonia", "luxembourg", "malta", "cyprus"
            ]
          }
        });
      }

      query.query = { bool: { must } };
      if (scroll_token) query.scroll_token = scroll_token;

      const response = await fetch(`${PDL_BASE}/person/search`, {
        method: "POST",
        headers: {
          "X-Api-Key": PDL_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        const errText = await response.text();
        // 404 means no results found - not an error
        if (response.status === 404) {
          return new Response(
            JSON.stringify({ success: true, leads_found: 0, total_from_pdl: 0, scroll_token: null, has_more: false }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error(`PDL API error [${response.status}]: ${errText}`);
      }

      const data = await response.json();
      const people = data.data || [];

      // Map PDL records to our leads schema
      const leads = people
        .filter((p: any) => p.first_name && (p.work_email || p.personal_emails?.length))
        .map((p: any) => ({
          first_name: p.first_name,
          last_name: p.last_name || "Unknown",
          title: p.job_title || role || "Professional",
          company: p.job_company_name || "Unknown",
          email: (p.work_email || p.personal_emails?.[0] || "").toLowerCase(),
          phone: p.mobile_phone || p.phone_numbers?.[0] || "",
          country: p.location_country || country || "Unknown",
          domain: p.work_email?.split("@")[1] || p.personal_emails?.[0]?.split("@")[1] || domain || "",
          industry: p.industry || industry || "General",
          company_size: p.job_company_size || "Unknown",
          seniority: p.job_title_levels?.[0] || inferSeniority(p.job_title || ""),
          verified: p.work_email ? "verified" : "likely",
          confidence: p.work_email ? 90 : 70,
          linkedin_url: p.linkedin_url || "",
        }))
        .filter((l: any) => l.email);

      // Bulk upsert
      let inserted = 0;
      for (let i = 0; i < leads.length; i += 100) {
        const chunk = leads.slice(i, i + 100);
        const { error } = await supabase
          .from("leads")
          .upsert(chunk, { onConflict: "email" });
        if (!error) inserted += chunk.length;
        else console.error("DB error:", error.message);
      }

      return new Response(
        JSON.stringify({
          success: true,
          leads_found: inserted,
          total_from_pdl: data.total || 0,
          scroll_token: data.scroll_token || null,
          has_more: !!data.scroll_token,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid mode" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PDL error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function inferSeniority(title: string): string {
  const t = title.toLowerCase();
  if (/\b(ceo|cto|cfo|coo|cio|founder|chief|president|owner)\b/.test(t)) return "C-Level";
  if (/\b(vp|vice president)\b/.test(t)) return "VP";
  if (/\b(director|head of)\b/.test(t)) return "Director";
  if (/\b(manager|lead|team lead)\b/.test(t)) return "Manager";
  return "Individual Contributor";
}
