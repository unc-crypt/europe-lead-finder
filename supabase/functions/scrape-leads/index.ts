import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSearchQueries(query: string, country: string, industry: string): string[] {
  const queries: string[] = [];
  
  // Parse "role @ domain" pattern
  const atMatch = query.match(/^(.+?)\s*@\s*(.+)$/);
  
  if (atMatch) {
    const role = atMatch[1].trim();
    const domain = atMatch[2].trim();
    // Primary: role + domain email pattern
    queries.push(`"${role}" "@${domain}" email`);
    // LinkedIn variant
    queries.push(`"${role}" "@${domain}" site:linkedin.com`);
    // Directory variant
    queries.push(`"${role}" "${domain}" email contact`);
  } else {
    // General search
    const countryStr = country && country !== "All Countries" ? ` ${country}` : "";
    const industryStr = industry && industry !== "All Industries" ? ` ${industry}` : "";
    queries.push(`"${query}"${countryStr}${industryStr} email contact`);
    queries.push(`"${query}"${countryStr} site:linkedin.com`);
  }
  
  return queries;
}

interface ExtractedLead {
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

async function extractLeadsWithAI(
  searchResults: any[],
  query: string
): Promise<ExtractedLead[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured, skipping AI extraction");
    return [];
  }

  // Combine all search result content
  const content = searchResults
    .map((r: any) => {
      const parts = [];
      if (r.title) parts.push(`Title: ${r.title}`);
      if (r.description) parts.push(`Description: ${r.description}`);
      if (r.url) parts.push(`URL: ${r.url}`);
      if (r.markdown) parts.push(`Content: ${r.markdown.substring(0, 2000)}`);
      return parts.join("\n");
    })
    .join("\n---\n")
    .substring(0, 15000); // Limit context size

  if (!content.trim()) return [];

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are a lead extraction engine. Extract professional contact information from web search results. Return structured data for each person found. Be thorough — extract every person you can find with an email address. If you can infer information (like domain from email), do so.`,
        },
        {
          role: "user",
          content: `Extract all professional leads from these search results for the query "${query}". Return structured data for each person.\n\n${content}`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "extract_leads",
            description: "Extract structured lead data from search results",
            parameters: {
              type: "object",
              properties: {
                leads: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      first_name: { type: "string" },
                      last_name: { type: "string" },
                      title: { type: "string", description: "Job title" },
                      company: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      country: { type: "string" },
                      domain: { type: "string", description: "Company website domain" },
                      industry: { type: "string" },
                      linkedin_url: { type: "string" },
                    },
                    required: ["first_name", "last_name", "email"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["leads"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "extract_leads" } },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("AI gateway error:", response.status, errText);
    return [];
  }

  const aiData = await response.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    console.error("No tool call in AI response");
    return [];
  }

  try {
    const parsed = JSON.parse(toolCall.function.arguments);
    return (parsed.leads || [])
      .filter((l: any) => l.email && l.first_name && l.last_name)
      .map((l: any) => ({
        first_name: l.first_name || "Unknown",
        last_name: l.last_name || "Unknown",
        title: l.title || "N/A",
        company: l.company || "Unknown",
        email: l.email,
        phone: l.phone || "",
        country: l.country || "Unknown",
        domain: l.domain || l.email.split("@")[1] || "",
        industry: l.industry || "General",
        company_size: "Unknown",
        seniority: inferSeniority(l.title || ""),
        verified: "likely",
        confidence: 65,
        linkedin_url: l.linkedin_url || "",
      }));
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return [];
  }
}

function inferSeniority(title: string): string {
  const t = title.toLowerCase();
  if (/\b(ceo|cto|cfo|coo|cio|founder|co-founder|chief)\b/.test(t)) return "C-Level";
  if (/\b(vp|vice president)\b/.test(t)) return "VP";
  if (/\b(director|head of)\b/.test(t)) return "Director";
  if (/\b(manager|lead|team lead)\b/.test(t)) return "Manager";
  return "Individual Contributor";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      throw new Error("Firecrawl connector not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { query, country, industry, company_size, seniority, page = 1, per_page = 25 } = await req.json();

    if (!query || !query.trim()) {
      return new Response(
        JSON.stringify({ leads: [], total: 0, page: 1 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Check database cache first
    const atMatch = query.match(/^(.+?)\s*@\s*(.+)$/);
    let cacheQuery = supabase.from("leads").select("*", { count: "exact" });
    
    if (atMatch) {
      const role = atMatch[1].trim();
      const domain = atMatch[2].trim();
      cacheQuery = cacheQuery.ilike("domain", `%${domain}%`);
      if (role.length > 2) {
        cacheQuery = cacheQuery.or(`title.ilike.%${role}%,first_name.ilike.%${role}%,last_name.ilike.%${role}%`);
      }
    } else {
      cacheQuery = cacheQuery.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,title.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`
      );
    }

    // Apply filters
    if (country && country !== "All Countries") {
      cacheQuery = cacheQuery.ilike("country", `%${country}%`);
    }
    if (industry && industry !== "All Industries") {
      cacheQuery = cacheQuery.ilike("industry", `%${industry}%`);
    }
    if (company_size && company_size !== "All Sizes") {
      cacheQuery = cacheQuery.eq("company_size", company_size);
    }
    if (seniority && seniority !== "All Levels") {
      cacheQuery = cacheQuery.eq("seniority", seniority);
    }

    const offset = (page - 1) * per_page;
    cacheQuery = cacheQuery.range(offset, offset + per_page - 1);

    const { data: cachedLeads, count: cachedCount } = await cacheQuery;

    // If we have cached results, return them and scrape in background
    if (cachedLeads && cachedLeads.length > 0) {
      console.log(`Found ${cachedLeads.length} cached leads, returning immediately`);
      
      // Fire off scraping in background (don't await)
      scrapeAndStore(query, country, industry, FIRECRAWL_API_KEY, supabase).catch(
        (e) => console.error("Background scrape error:", e)
      );

      return new Response(
        JSON.stringify({
          leads: cachedLeads.map(formatLead),
          total: cachedCount || cachedLeads.length,
          page,
          per_page,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: No cache — scrape now
    console.log("No cached results, scraping...");
    const leads = await scrapeAndStore(query, country, industry, FIRECRAWL_API_KEY, supabase);

    // Apply pagination
    const paginatedLeads = leads.slice(offset, offset + per_page);

    return new Response(
      JSON.stringify({
        leads: paginatedLeads.map(formatLead),
        total: leads.length,
        page,
        per_page,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scrape error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function scrapeAndStore(
  query: string,
  country: string,
  industry: string,
  apiKey: string,
  supabase: any
): Promise<ExtractedLead[]> {
  const searchQueries = buildSearchQueries(query, country, industry);
  const allResults: any[] = [];

  // Search with Firecrawl (parallel)
  const searchPromises = searchQueries.map(async (sq) => {
    console.log("Firecrawl search:", sq);
    try {
      const response = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: sq,
          limit: 10,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Firecrawl search failed [${response.status}]:`, errText);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (e) {
      console.error("Firecrawl search error:", e);
      return [];
    }
  });

  const results = await Promise.all(searchPromises);
  results.forEach((r) => allResults.push(...r));

  if (allResults.length === 0) {
    console.log("No search results found");
    return [];
  }

  console.log(`Got ${allResults.length} search results, extracting leads with AI...`);

  // Extract leads using AI
  const leads = await extractLeadsWithAI(allResults, query);
  console.log(`Extracted ${leads.length} leads`);

  // Store in database
  if (leads.length > 0) {
    const dbLeads = leads.map((l) => ({
      first_name: l.first_name,
      last_name: l.last_name,
      title: l.title,
      company: l.company,
      email: l.email,
      phone: l.phone,
      country: l.country,
      domain: l.domain,
      industry: l.industry,
      company_size: l.company_size,
      seniority: l.seniority,
      verified: l.verified,
      confidence: l.confidence,
      linkedin_url: l.linkedin_url,
    }));

    const { error: upsertError } = await supabase
      .from("leads")
      .upsert(dbLeads, { onConflict: "email" });

    if (upsertError) {
      console.error("DB upsert error:", upsertError);
    }
  }

  return leads;
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
