import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  organization?: {
    name: string;
    website_url: string;
    industry: string;
    estimated_num_employees: number;
    primary_domain: string;
  };
  email: string;
  phone_numbers?: { raw_number: string }[];
  country: string;
  linkedin_url: string;
  email_status: string;
}

function mapCompanySize(count: number | undefined): string {
  if (!count) return "Unknown";
  if (count <= 10) return "1-10";
  if (count <= 50) return "10-50";
  if (count <= 200) return "50-200";
  if (count <= 500) return "200-500";
  return "500+";
}

function mapSeniority(title: string): string {
  const t = (title || "").toLowerCase();
  if (/\b(ceo|cto|cfo|coo|cio|founder|co-founder|chief)\b/.test(t)) return "C-Level";
  if (/\b(vp|vice president)\b/.test(t)) return "VP";
  if (/\b(director|head of)\b/.test(t)) return "Director";
  if (/\b(manager|lead|team lead)\b/.test(t)) return "Manager";
  return "Individual Contributor";
}

function mapVerified(status: string): string {
  if (status === "verified") return "verified";
  if (status === "guessed" || status === "likely") return "likely";
  return "unverified";
}

function mapConfidence(status: string): number {
  if (status === "verified") return 95;
  if (status === "guessed" || status === "likely") return 70;
  return 40;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const APOLLO_API_KEY = Deno.env.get("APOLLO_API_KEY");
    if (!APOLLO_API_KEY) {
      throw new Error("APOLLO_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { query, title, domain, country, industry, company_size, seniority, page = 1, per_page = 25 } = await req.json();

    // Build Apollo API request body
    const apolloBody: Record<string, unknown> = {
      page,
      per_page,
    };

    // Parse "role @ domain" pattern
    let searchTitle = title || "";
    let searchDomain = domain || "";

    if (query) {
      const atMatch = query.match(/^(.+?)\s*@\s*(.+)$/);
      if (atMatch) {
        searchTitle = atMatch[1].trim();
        searchDomain = atMatch[2].trim();
      } else {
        apolloBody.q_keywords = query;
      }
    }

    if (searchTitle) {
      apolloBody.person_titles = [searchTitle];
    }

    if (searchDomain) {
      apolloBody.q_organization_domains = searchDomain;
    }

    if (country && country !== "All Countries") {
      apolloBody.person_locations = [country];
    }

    if (industry && industry !== "All Industries") {
      apolloBody.organization_industry_tag_ids = [];
      apolloBody.q_organization_keyword_tags = [industry];
    }

    if (company_size && company_size !== "All Sizes") {
      const sizeMap: Record<string, string[]> = {
        "1-10": ["1,10"],
        "10-50": ["11,50"],
        "50-200": ["51,200"],
        "200-500": ["201,500"],
        "500+": ["501,10000"],
      };
      apolloBody.organization_num_employees_ranges = sizeMap[company_size] || [];
    }

    if (seniority && seniority !== "All Levels") {
      const seniorityMap: Record<string, string[]> = {
        "C-Level": ["c_suite", "founder", "owner"],
        "VP": ["vp"],
        "Director": ["director"],
        "Manager": ["manager"],
        "Individual Contributor": ["senior", "entry"],
      };
      apolloBody.person_seniorities = seniorityMap[seniority] || [];
    }

    console.log("Apollo request:", JSON.stringify(apolloBody));

    // Call Apollo People Search API
    const apolloRes = await fetch("https://api.apollo.io/v1/mixed_people/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": APOLLO_API_KEY,
      },
      body: JSON.stringify(apolloBody),
    });

    if (!apolloRes.ok) {
      const errText = await apolloRes.text();
      throw new Error(`Apollo API error [${apolloRes.status}]: ${errText}`);
    }

    const apolloData = await apolloRes.json();
    const contacts: ApolloContact[] = apolloData.people || [];
    const totalCount = apolloData.pagination?.total_entries || 0;

    // Map to our Lead format
    const leads = contacts.map((c) => ({
      apollo_id: c.id,
      first_name: c.first_name || "Unknown",
      last_name: c.last_name || "Unknown",
      title: c.title || "N/A",
      company: c.organization?.name || "Unknown",
      email: c.email || "",
      phone: c.phone_numbers?.[0]?.raw_number || "",
      country: c.country || "Unknown",
      domain: c.organization?.primary_domain || "",
      industry: c.organization?.industry || "General",
      company_size: mapCompanySize(c.organization?.estimated_num_employees),
      seniority: mapSeniority(c.title),
      verified: mapVerified(c.email_status),
      confidence: mapConfidence(c.email_status),
      linkedin_url: c.linkedin_url || "",
      raw_data: c,
    }));

    // Cache results in database (upsert)
    if (leads.length > 0) {
      const { error: upsertError } = await supabase
        .from("leads")
        .upsert(leads, { onConflict: "apollo_id", ignoreDuplicates: false });

      if (upsertError) {
        console.error("Cache upsert error:", upsertError);
      }
    }

    return new Response(
      JSON.stringify({
        leads,
        total: totalCount,
        page,
        per_page,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
