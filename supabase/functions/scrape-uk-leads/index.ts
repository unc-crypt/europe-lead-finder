import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── UK Industries ─────────────────────────────────────────────────────────────
const UK_INDUSTRIES = [
  "accountants", "solicitors", "architects", "surveyors",
  "financial-advisors", "mortgage-brokers", "insurance-brokers",
  "recruitment-agencies", "marketing-agencies", "it-services",
  "management-consultants", "hr-consultants", "pr-agencies",
  "dentists", "opticians", "physiotherapists", "chiropractors",
  "care-homes", "pharmacies", "private-hospitals",
  "builders", "plumbers", "electricians", "roofers", "decorators",
  "landscapers", "heating-engineers",
  "restaurants", "hotels", "catering-companies",
  "wedding-venues", "event-planners", "florists",
  "nurseries", "driving-schools", "language-schools",
  "car-dealers", "garages", "couriers",
  "estate-agents", "letting-agents", "gyms", "beauty-salons",
  "hairdressers", "photographers", "security-companies",
  "cleaning-companies", "pest-control",
];

// ── UK Regions ────────────────────────────────────────────────────────────────
const UK_REGIONS = [
  "London", "Birmingham", "Manchester", "Leeds", "Sheffield",
  "Liverpool", "Bristol", "Newcastle", "Nottingham", "Leicester",
  "Brighton", "Portsmouth", "Southampton", "Oxford", "Cambridge",
  "Reading", "Edinburgh", "Glasgow", "Cardiff", "Belfast",
  "Aberdeen", "Dundee", "Swansea", "Plymouth", "Exeter",
  "Norwich", "Ipswich", "York", "Hull", "Derby",
  "Coventry", "Wolverhampton", "Stoke-on-Trent", "Sunderland",
  "Bath", "Chester", "Canterbury", "Bournemouth", "Milton Keynes",
];

// ── Search query templates ────────────────────────────────────────────────────
const SEARCH_TEMPLATES = [
  `{industry} {region} email contact`,
  `{industry} in {region} UK email address phone`,
  `{industry} near {region} contact us email`,
  `site:yell.com {industry} {region}`,
  `site:freeindex.co.uk {industry} {region}`,
  `site:checkatrade.com {industry} {region}`,
  `site:thomsonlocal.com {industry} {region}`,
  `site:bark.com {industry} {region}`,
  `"{industry}" "{region}" "@" email -noreply`,
  `"{industry}" "{region}" "contact" "email" site:.co.uk`,
];

// ── Junk email filtering ──────────────────────────────────────────────────────
const JUNK_DOMAINS = new Set([
  "example.com", "test.com", "domain.com", "email.com",
  "noreply.com", "no-reply.com", "donotreply.com",
  "mailinator.com", "tempmail.com", "guerrillamail.com",
  "sentry.io", "wixpress.com", "amazonaws.com", "cloudfront.net",
  "googletagmanager.com", "facebook.com", "twitter.com",
  "instagram.com", "linkedin.com", "tiktok.com", "youtube.com",
  "w3.org", "schema.org", "apple.com", "microsoft.com",
  "google.com", "yell.com", "freeindex.co.uk", "checkatrade.com",
  "thomsonlocal.com", "bark.com", "houzz.co.uk", "trustatrader.com",
]);

const JUNK_PREFIXES = new Set([
  "noreply", "no-reply", "donotreply", "do-not-reply",
  "postmaster", "mailer-daemon", "bounce", "unsubscribe",
  "admin", "webmaster", "hostmaster", "abuse",
]);

function isValidEmail(email: string): boolean {
  if (!email || !email.includes("@") || email.length < 6) return false;
  const [local, domain] = email.split("@");
  if (JUNK_DOMAINS.has(domain)) return false;
  if (JUNK_PREFIXES.has(local.toLowerCase())) return false;
  if (!domain.includes(".")) return false;
  if (/\.(png|jpg|gif|css|js|svg|ico|woff)$/.test(domain)) return false;
  return true;
}

function inferSeniority(title: string): string {
  const t = title.toLowerCase();
  if (/\b(ceo|cto|cfo|coo|founder|chief|president|owner|proprietor|principal)\b/.test(t)) return "C-Level";
  if (/\b(director|head of)\b/.test(t)) return "Director";
  if (/\b(manager|lead|team lead|supervisor)\b/.test(t)) return "Manager";
  if (/\b(partner|associate)\b/.test(t)) return "Senior";
  return "Individual Contributor";
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("Firecrawl not configured");
    if (!LOVABLE_API_KEY) throw new Error("AI not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const cycleIndex = body.cycle_index ?? Math.floor(Date.now() / 60000);
    const batchSize = body.batch_size ?? 6;

    // Pick industry/region/template combos for this cycle
    const searches: { query: string; industry: string; region: string }[] = [];
    for (let i = 0; i < batchSize; i++) {
      const idx = cycleIndex * batchSize + i;
      const indIdx = idx % UK_INDUSTRIES.length;
      const regIdx = Math.floor(idx / UK_INDUSTRIES.length) % UK_REGIONS.length;
      const tplIdx = Math.floor(idx / (UK_INDUSTRIES.length * UK_REGIONS.length)) % SEARCH_TEMPLATES.length;

      const industry = UK_INDUSTRIES[indIdx];
      const region = UK_REGIONS[regIdx];
      const query = SEARCH_TEMPLATES[tplIdx]
        .replace("{industry}", industry)
        .replace("{region}", region);

      searches.push({ query, industry, region });
    }

    console.log(`UK scraper: ${searches.length} searches, cycle ${cycleIndex}`);

    let totalLeads = 0;

    const results = await Promise.all(
      searches.map(async ({ query, industry, region }) => {
        try {
          // Use Firecrawl SEARCH (not scrape) — works better for directories
          const fcRes = await fetch("https://api.firecrawl.dev/v1/search", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query,
              limit: 10,
              lang: "en",
              country: "gb",
              scrapeOptions: { formats: ["markdown"] },
            }),
          });

          if (!fcRes.ok) {
            console.error(`Search failed for "${query}": ${fcRes.status}`);
            return 0;
          }

          const fcData = await fcRes.json();
          const searchResults = fcData.data || [];

          // Combine all scraped content
          const allContent = searchResults
            .map((r: any) => {
              const parts = [];
              if (r.title) parts.push(r.title);
              if (r.description) parts.push(r.description);
              if (r.markdown) parts.push(r.markdown.substring(0, 3000));
              return parts.join("\n");
            })
            .join("\n---\n")
            .substring(0, 30000);

          if (!allContent || allContent.length < 50) return 0;

          // Use AI to extract leads
          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                  content: `You extract UK business leads from search results. For each business or person found, extract:
- email (REQUIRED - skip entries without email)
- full_name (contact person)
- company (business name)
- phone (UK format)
- job_title
- address (with UK postcode if visible)

CRITICAL: Only return entries where you found a REAL email address. Filter out directory platform emails.
Industry: ${industry} | Region: ${region}`,
                },
                {
                  role: "user",
                  content: `Extract ALL business leads with emails from these UK ${industry} search results in ${region}:\n\n${allContent}`,
                },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "save_leads",
                    parameters: {
                      type: "object",
                      properties: {
                        leads: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              email: { type: "string" },
                              full_name: { type: "string" },
                              company: { type: "string" },
                              phone: { type: "string" },
                              job_title: { type: "string" },
                              address: { type: "string" },
                            },
                            required: ["email"],
                          },
                        },
                      },
                      required: ["leads"],
                    },
                  },
                },
              ],
              tool_choice: { type: "function", function: { name: "save_leads" } },
            }),
          });

          if (!aiRes.ok) return 0;
          const aiData = await aiRes.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (!toolCall) return 0;

          const parsed = JSON.parse(toolCall.function.arguments);
          const rawLeads = parsed.leads || [];

          // Transform, filter, deduplicate
          const dbLeads: any[] = [];
          const seen = new Set<string>();

          for (const lead of rawLeads) {
            if (!lead.email) continue;
            const email = lead.email.toLowerCase().trim();
            if (!isValidEmail(email) || seen.has(email)) continue;
            seen.add(email);

            const nameParts = (lead.full_name || "").trim().split(/\s+/);
            const firstName = nameParts[0] || "Unknown";
            const lastName = nameParts.slice(1).join(" ") || "Unknown";
            const domain = email.split("@")[1];

            dbLeads.push({
              first_name: firstName,
              last_name: lastName,
              email,
              company: lead.company || null,
              phone: lead.phone || null,
              title: lead.job_title || null,
              domain,
              country: "United Kingdom",
              industry: industry.replace(/-/g, " "),
              seniority: inferSeniority(lead.job_title || ""),
              company_size: "SME",
              verified: "likely",
              confidence: 65,
            });
          }

          if (dbLeads.length > 0) {
            const { error } = await supabase
              .from("leads")
              .upsert(dbLeads, { onConflict: "email" });
            if (error) console.error(`DB error:`, error.message);
            else console.log(`Saved ${dbLeads.length} leads for ${industry} in ${region}`);
          }

          return dbLeads.length;
        } catch (e) {
          console.error(`Error:`, e);
          return 0;
        }
      })
    );

    totalLeads = results.reduce((a, b) => a + b, 0);

    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    console.log(`UK scraper done: ${totalLeads} leads, ${count} total in DB`);

    return new Response(
      JSON.stringify({
        success: true,
        leads_found: totalLeads,
        total_in_db: count || 0,
        searches_run: searches.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("UK scraper error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
