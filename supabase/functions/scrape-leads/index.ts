import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LeadRow {
  apollo_id?: string;
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  domain: string;
  industry: string;
  company_size: string;
  seniority: string;
  verified: string;
  confidence: number;
  linkedin_url: string;
}

function inferSeniority(title: string): string {
  const t = title.toLowerCase();
  if (/\b(ceo|cto|cfo|coo|cio|founder|co-founder|chief|president|owner)\b/.test(t)) return "C-Level";
  if (/\b(vp|vice president)\b/.test(t)) return "VP";
  if (/\b(director|head of|principal)\b/.test(t)) return "Director";
  if (/\b(manager|lead|team lead|supervisor)\b/.test(t)) return "Manager";
  if (/\b(senior|sr\.)\b/.test(t)) return "Senior";
  return "Individual Contributor";
}

function formatLead(l: any) {
  return {
    apollo_id: l.apollo_id || l.id || "",
    first_name: l.first_name,
    last_name: l.last_name,
    title: l.title || "N/A",
    company: l.company || "Unknown",
    email: l.email || "",
    phone: l.phone || "",
    country: l.country || "Unknown",
    domain: l.domain || "",
    industry: l.industry || "General",
    company_size: l.company_size || "Unknown",
    seniority: l.seniority || "Unknown",
    verified: l.verified || "unverified",
    confidence: l.confidence || 40,
    linkedin_url: l.linkedin_url || "",
  };
}

function parseRoleAndDomain(query: string) {
  const atMatch = query.match(/^(.+?)\s*@\s*(.+)$/);
  if (!atMatch) return { role: query.trim(), domain: "" };
  return { role: atMatch[1].trim(), domain: atMatch[2].trim().toLowerCase() };
}

function buildPdlQuery(query: string, country: string, industry: string, seniority: string) {
  const { role, domain } = parseRoleAndDomain(query);
  const must: any[] = [];

  if (role) must.push({ match: { job_title: role } });
  if (country && country !== "All Countries") must.push({ term: { location_country: country.toLowerCase() } });
  if (industry && industry !== "All Industries") must.push({ match: { industry } });
  if (domain) {
    must.push({
      bool: {
        should: [
          { wildcard: { work_email: `*@${domain}` } },
          { wildcard: { job_company_website: `*${domain}*` } },
        ],
        minimum_should_match: 1,
      },
    });
  }

  if (seniority && seniority !== "All Levels") {
    must.push({ match: { job_title: seniority } });
  }

  if (!country || country === "All Countries") {
    must.push({
      terms: {
        location_country: [
          "germany", "france", "italy", "spain", "netherlands", "poland", "bulgaria", "czech republic",
          "romania", "austria", "sweden", "belgium", "portugal", "switzerland", "denmark", "norway",
          "finland", "ireland", "greece", "hungary", "croatia", "united kingdom", "slovakia", "slovenia",
          "lithuania", "latvia", "estonia", "luxembourg", "malta", "cyprus",
        ],
      },
    });
  }

  return { bool: { must } };
}

async function fetchPdlLeads(query: string, country: string, industry: string, seniority: string, perPage: number): Promise<LeadRow[]> {
  const PDL_API_KEY = Deno.env.get("PDL_API_KEY");
  if (!PDL_API_KEY) return [];

  const response = await fetch("https://api.peopledatalabs.com/v5/person/search", {
    method: "POST",
    headers: {
      "X-Api-Key": PDL_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      size: Math.min(perPage, 100),
      query: buildPdlQuery(query, country, industry, seniority),
    }),
  });

  if (!response.ok) return [];
  const data = await response.json();
  const people = data.data || [];

  return people
    .filter((p: any) => p.first_name && (p.work_email || p.personal_emails?.length))
    .map((p: any) => ({
      first_name: p.first_name,
      last_name: p.last_name || "Unknown",
      title: p.job_title || "Professional",
      company: p.job_company_name || "Unknown",
      email: (p.work_email || p.personal_emails?.[0] || "").toLowerCase(),
      phone: p.mobile_phone || p.phone_numbers?.[0] || "",
      country: p.location_country || country || "Unknown",
      domain: p.work_email?.split("@")[1] || p.personal_emails?.[0]?.split("@")[1] || "",
      industry: p.industry || industry || "General",
      company_size: p.job_company_size || "Unknown",
      seniority: p.job_title_levels?.[0] || inferSeniority(p.job_title || ""),
      verified: p.work_email ? "verified" : "likely",
      confidence: p.work_email ? 90 : 70,
      linkedin_url: p.linkedin_url || "",
    }))
    .filter((lead: LeadRow) => !!lead.email);
}

async function fetchApolloLeads(query: string, country: string, industry: string, companySize: string, seniority: string, page: number, perPage: number): Promise<{ leads: LeadRow[]; total: number }> {
  const APOLLO_API_KEY = Deno.env.get("APOLLO_API_KEY");
  if (!APOLLO_API_KEY) return { leads: [], total: 0 };

  const { role, domain } = parseRoleAndDomain(query);
  const body: Record<string, unknown> = { page, per_page: perPage };

  if (domain) {
    body.person_titles = role ? [role] : [];
    body.q_organization_domains = domain;
  } else if (query.trim()) {
    body.q_keywords = query.trim();
  }

  if (country && country !== "All Countries") body.person_locations = [country];
  if (industry && industry !== "All Industries") body.q_organization_keyword_tags = [industry];

  if (companySize && companySize !== "All Sizes") {
    const sizeMap: Record<string, string[]> = {
      "1-10": ["1,10"],
      "10-50": ["11,50"],
      "50-200": ["51,200"],
      "200-500": ["201,500"],
      "500-1000": ["501,1000"],
      "1000-5000": ["1001,5000"],
      "5000-10000": ["5001,10000"],
      "10000+": ["10001,50000"],
    };
    body.organization_num_employees_ranges = sizeMap[companySize] || [];
  }

  if (seniority && seniority !== "All Levels") {
    const seniorityMap: Record<string, string[]> = {
      "C-Level": ["c_suite", "founder", "owner"],
      "VP": ["vp"],
      "Director": ["director"],
      "Manager": ["manager"],
      "Senior": ["senior"],
      "Individual Contributor": ["entry"],
    };
    body.person_seniorities = seniorityMap[seniority] || [];
  }

  const response = await fetch("https://api.apollo.io/v1/people/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Api-Key": APOLLO_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) return { leads: [], total: 0 };
  const data = await response.json();
  const contacts = data.people || [];

  return {
    total: data.pagination?.total_entries || 0,
    leads: contacts
      .filter((c: any) => c.email)
      .map((c: any) => ({
        apollo_id: c.id,
        first_name: c.first_name || "Unknown",
        last_name: c.last_name || "Unknown",
        title: c.title || "N/A",
        company: c.organization?.name || "Unknown",
        email: c.email || "",
        phone: c.phone_numbers?.[0]?.raw_number || "",
        country: c.country || "Unknown",
        domain: c.organization?.primary_domain || c.email?.split("@")[1] || "",
        industry: c.organization?.industry || industry || "General",
        company_size: c.organization?.estimated_num_employees ? String(c.organization.estimated_num_employees) : "Unknown",
        seniority: inferSeniority(c.title || ""),
        verified: c.email_status === "verified" ? "verified" : "likely",
        confidence: c.email_status === "verified" ? 95 : 70,
        linkedin_url: c.linkedin_url || "",
      })),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      query,
      country = "All Countries",
      industry = "All Industries",
      company_size = "All Sizes",
      seniority = "All Levels",
      page = 1,
      per_page = 25,
    } = await req.json();

    if (!query || !query.trim()) {
      return new Response(JSON.stringify({ leads: [], total: 0, page: 1, per_page }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let cacheQuery = supabase.from("leads").select("*", { count: "exact" });
    const { role, domain } = parseRoleAndDomain(query);

    if (domain) {
      cacheQuery = cacheQuery.ilike("domain", `%${domain}%`);
      if (role.length > 2) {
        cacheQuery = cacheQuery.or(`title.ilike.%${role}%,first_name.ilike.%${role}%,last_name.ilike.%${role}%`);
      }
    } else {
      cacheQuery = cacheQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,title.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%,industry.ilike.%${query}%`);
    }

    if (country !== "All Countries") cacheQuery = cacheQuery.ilike("country", `%${country}%`);
    if (industry !== "All Industries") cacheQuery = cacheQuery.ilike("industry", `%${industry}%`);
    if (company_size !== "All Sizes") cacheQuery = cacheQuery.eq("company_size", company_size);
    if (seniority !== "All Levels") cacheQuery = cacheQuery.eq("seniority", seniority);

    const offset = (page - 1) * per_page;
    cacheQuery = cacheQuery.range(offset, offset + per_page - 1);

    const { data: cachedLeads, count: cachedCount } = await cacheQuery;

    if (cachedLeads && cachedLeads.length >= per_page) {
      return new Response(JSON.stringify({
        leads: cachedLeads.map(formatLead),
        total: cachedCount || cachedLeads.length,
        page,
        per_page,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let importedLeads = await fetchPdlLeads(query, country, industry, seniority, per_page);
    let total = importedLeads.length;

    if (importedLeads.length === 0) {
      const apollo = await fetchApolloLeads(query, country, industry, company_size, seniority, page, per_page);
      importedLeads = apollo.leads;
      total = apollo.total || importedLeads.length;
    }

    if (importedLeads.length > 0) {
      for (let i = 0; i < importedLeads.length; i += 100) {
        const chunk = importedLeads.slice(i, i + 100);
        await supabase.from("leads").upsert(chunk, { onConflict: "email" });
      }
    }

    const combined = [
      ...(cachedLeads || []).map(formatLead),
      ...importedLeads.filter((lead) => !(cachedLeads || []).some((cached: any) => cached.email === lead.email)).map(formatLead),
    ].slice(0, per_page);

    return new Response(JSON.stringify({
      leads: combined,
      total: Math.max(total, cachedCount || 0, combined.length),
      page,
      per_page,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});