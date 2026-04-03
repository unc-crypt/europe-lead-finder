import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// European professional directories and sources to scrape
const DIRECTORY_PATTERNS = [
  "site:linkedin.com/in",
  "site:xing.com/profile",
  "email contact",
  "site:europages.com",
  "site:kompass.com",
  "site:yellowpages.com",
  "directory email",
  "professional association members email",
  "chamber of commerce members",
  "\"@\" email contact list",
];

// European country-specific search modifiers
const COUNTRY_SEARCH_HINTS: Record<string, string[]> = {
  "Germany": ["Deutschland", "site:de", "@gmx.de OR @web.de OR @t-online.de"],
  "France": ["France", "site:fr", "@orange.fr OR @free.fr OR @wanadoo.fr"],
  "Italy": ["Italia", "site:it", "@libero.it OR @virgilio.it OR @tin.it"],
  "Spain": ["España", "site:es", "@terra.es OR @telefonica.net"],
  "Netherlands": ["Nederland", "site:nl", "@planet.nl OR @kpnmail.nl"],
  "Poland": ["Polska", "site:pl", "@wp.pl OR @o2.pl OR @interia.pl"],
  "Bulgaria": ["България", "site:bg", "@abv.bg OR @mail.bg"],
  "Czech Republic": ["Česko", "site:cz", "@seznam.cz OR @centrum.cz"],
  "Romania": ["România", "site:ro", "@yahoo.ro"],
  "Sweden": ["Sverige", "site:se", "@telia.com"],
  "Austria": ["Österreich", "site:at", "@gmx.at OR @aon.at"],
  "Belgium": ["Belgique", "site:be"],
  "Portugal": ["Portugal", "site:pt"],
  "Switzerland": ["Schweiz", "site:ch"],
  "Denmark": ["Danmark", "site:dk"],
  "Norway": ["Norge", "site:no"],
  "Finland": ["Suomi", "site:fi"],
  "Ireland": ["Ireland", "site:ie"],
  "Greece": ["Ελλάδα", "site:gr"],
  "Hungary": ["Magyarország", "site:hu"],
  "Croatia": ["Hrvatska", "site:hr"],
  "United Kingdom": ["UK", "site:co.uk"],
};

function buildSearchQueries(
  query: string,
  country: string,
  industry: string,
  seniority: string
): string[] {
  const queries: string[] = [];
  const atMatch = query.match(/^(.+?)\s*@\s*(.+)$/);

  if (atMatch) {
    const role = atMatch[1].trim();
    const domain = atMatch[2].trim();
    // Many query variations to maximize results
    queries.push(`"${role}" "@${domain}" email`);
    queries.push(`"${role}" "${domain}" email contact`);
    queries.push(`"${role}" "@${domain}" site:linkedin.com/in`);
    queries.push(`"${role}" "${domain}" directory`);
    queries.push(`"${role}" email "${domain}" list`);
    queries.push(`"${role}" "@${domain}" phone`);
    queries.push(`"${role}" "${domain}" staff team`);
    queries.push(`"${role}" "${domain}" professional`);
  } else {
    const countryStr = country && country !== "All Countries" ? ` ${country}` : "";
    const industryStr = industry && industry !== "All Industries" ? ` ${industry}` : "";

    // Keep to max 6 queries for speed
    queries.push(`"${query}"${countryStr}${industryStr} email contact`);
    queries.push(`"${query}"${countryStr} site:linkedin.com/in`);
    queries.push(`"${query}"${countryStr}${industryStr} directory email list`);
    queries.push(`"${query}"${countryStr} "@" email phone`);
    queries.push(`"${query}"${countryStr} professional association email`);
    queries.push(`"${query}" email list${countryStr} 2024 2025`);
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
  query: string,
  targetCountry: string,
  targetIndustry: string
): Promise<ExtractedLead[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured");
    return [];
  }

  // Process all at once for speed
  const allLeads: ExtractedLead[] = [];
  const content = searchResults
    .map((r: any) => {
      const parts = [];
      if (r.title) parts.push(`Title: ${r.title}`);
      if (r.description) parts.push(`Desc: ${r.description}`);
      if (r.url) parts.push(`URL: ${r.url}`);
      if (r.markdown) parts.push(`Content: ${r.markdown.substring(0, 1500)}`);
      return parts.join("\n");
    })
    .join("\n---\n")
    .substring(0, 20000);

  if (!content.trim()) return [];

  {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a lead extraction engine. Extract EVERY professional contact you can find from web content. Be aggressive — extract names, emails, phone numbers, titles, and companies. If you see partial information, still include it. Generate plausible professional emails when you see a name and company domain. For each person, infer their job title, seniority, industry, and location from context. Extract as many leads as possible — quantity matters.`,
            },
            {
              role: "user",
              content: `Extract ALL professional leads from these search results. Query: "${query}". Target country: "${targetCountry}". Target industry: "${targetIndustry}". Return EVERY person you can identify.\n\n${content}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_leads",
                description: "Extract structured lead data",
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
                          title: { type: "string" },
                          company: { type: "string" },
                          email: { type: "string" },
                          phone: { type: "string" },
                          country: { type: "string" },
                          domain: { type: "string" },
                          industry: { type: "string" },
                          linkedin_url: { type: "string" },
                        },
                        required: ["first_name", "last_name"],
                      },
                    },
                  },
                  required: ["leads"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "extract_leads" } },
        }),
      });

      if (!response.ok) {
      return [];
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return [];

    const parsed = JSON.parse(toolCall.function.arguments);
    const leads = (parsed.leads || []).map((l: any) => ({
      first_name: l.first_name || "Unknown",
      last_name: l.last_name || "Unknown",
      title: l.title || "Professional",
      company: l.company || "Unknown",
      email: l.email || "",
      phone: l.phone || "",
      country: l.country || targetCountry || "Unknown",
      domain: l.domain || (l.email ? l.email.split("@")[1] : ""),
      industry: l.industry || targetIndustry || "General",
      company_size: "Unknown",
      seniority: inferSeniority(l.title || ""),
      verified: l.email ? "likely" : "unverified",
      confidence: l.email ? 65 : 30,
      linkedin_url: l.linkedin_url || "",
    }));

    return leads;
  } catch (e) {
    console.error("AI extraction error:", e);
    return [];
  }
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

async function firecrawlSearch(
  query: string,
  apiKey: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Firecrawl [${response.status}]:`, errText.substring(0, 200));
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (e) {
    console.error("Firecrawl error:", e);
    return [];
  }
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
        cacheQuery = cacheQuery.or(
          `title.ilike.%${role}%,first_name.ilike.%${role}%,last_name.ilike.%${role}%`
        );
      }
    } else {
      cacheQuery = cacheQuery.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,title.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%,industry.ilike.%${query}%`
      );
    }

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

    if (cachedLeads && cachedLeads.length >= per_page) {
      console.log(`Returning ${cachedLeads.length} cached leads (total: ${cachedCount})`);

      // Background scrape for more
      scrapeAndStore(query, country, industry, seniority, FIRECRAWL_API_KEY, supabase).catch(
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

    // Step 2: Scrape now
    console.log("Scraping for leads...");
    const leads = await scrapeAndStore(query, country, industry, seniority, FIRECRAWL_API_KEY, supabase);

    // Combine with any cached leads
    const allCached = cachedLeads || [];
    const cachedEmails = new Set(allCached.map((l: any) => l.email));
    const newLeads = leads.filter((l) => !cachedEmails.has(l.email));
    const combined = [...allCached.map(formatLead), ...newLeads.map(formatLead)];

    const paginatedLeads = combined.slice(0, per_page);

    return new Response(
      JSON.stringify({
        leads: paginatedLeads,
        total: Math.max(combined.length, cachedCount || 0),
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
  seniority: string,
  apiKey: string,
  supabase: any
): Promise<ExtractedLead[]> {
  const searchQueries = buildSearchQueries(query, country, industry, seniority);
  console.log(`Running ${searchQueries.length} search queries...`);

  // Run searches in parallel batches of 4 to avoid rate limits
  const PARALLEL = 4;
  const allResults: any[] = [];

  for (let i = 0; i < searchQueries.length; i += PARALLEL) {
    const batch = searchQueries.slice(i, i + PARALLEL);
    const promises = batch.map((sq) => {
      console.log("Search:", sq.substring(0, 80));
      return firecrawlSearch(sq, apiKey, 10);
    });
    const results = await Promise.all(promises);
    results.forEach((r) => allResults.push(...r));
  }

  if (allResults.length === 0) {
    console.log("No search results");
    return [];
  }

  console.log(`Got ${allResults.length} search results, extracting leads...`);

  const leads = await extractLeadsWithAI(allResults, query, country, industry);
  
  // Deduplicate by email
  const seen = new Set<string>();
  const unique = leads.filter((l) => {
    if (!l.email || seen.has(l.email.toLowerCase())) return false;
    seen.add(l.email.toLowerCase());
    return true;
  });

  console.log(`Extracted ${unique.length} unique leads`);

  // Store in database
  if (unique.length > 0) {
    const dbLeads = unique.map((l) => ({
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

    // Batch insert in chunks of 50
    for (let i = 0; i < dbLeads.length; i += 50) {
      const chunk = dbLeads.slice(i, i + 50);
      const { error } = await supabase
        .from("leads")
        .upsert(chunk, { onConflict: "email" });
      if (error) console.error("DB upsert error:", error.message);
    }
  }

  return unique;
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
