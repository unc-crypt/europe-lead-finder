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
  "care-homes", "nursing-homes", "pharmacies", "private-hospitals",
  "cosmetic-surgeons", "psychologists", "nutritionists",
  "builders", "plumbers", "electricians", "roofers", "decorators",
  "landscapers", "joiners", "plasterers", "heating-engineers",
  "kitchen-fitters", "bathroom-fitters", "glaziers", "locksmiths",
  "restaurants", "hotels", "pubs", "cafes", "catering-companies",
  "wedding-venues", "event-planners", "florists", "bakeries",
  "nurseries", "tutors", "driving-schools", "language-schools",
  "charities", "community-organisations",
  "car-dealers", "garages", "mot-centres", "couriers",
  "removal-companies", "van-hire", "taxi-companies",
  "estate-agents", "letting-agents", "gyms", "beauty-salons",
  "hairdressers", "photographers", "printers", "security-companies",
  "cleaning-companies", "pest-control", "skip-hire",
];

// ── UK Regions ────────────────────────────────────────────────────────────────
const UK_REGIONS = [
  "london", "central-london", "east-london", "north-london",
  "south-london", "west-london", "croydon", "bromley", "enfield",
  "barnet", "harrow", "ealing", "richmond", "kingston",
  "birmingham", "coventry", "wolverhampton", "reading", "oxford",
  "milton-keynes", "slough", "guildford", "brighton", "portsmouth",
  "southampton", "basingstoke", "maidstone", "canterbury",
  "manchester", "salford", "stockport", "bolton", "wigan",
  "liverpool", "wirral", "warrington", "chester", "blackpool",
  "preston", "leeds", "bradford", "sheffield", "hull", "york",
  "wakefield", "huddersfield", "doncaster", "nottingham", "derby",
  "leicester", "lincoln", "northampton", "peterborough",
  "stoke-on-trent", "shrewsbury", "worcester",
  "norwich", "ipswich", "colchester", "chelmsford", "cambridge",
  "luton", "watford", "bristol", "bath", "exeter", "plymouth",
  "gloucester", "swindon", "bournemouth", "newcastle", "sunderland",
  "middlesbrough", "durham", "glasgow", "edinburgh", "aberdeen",
  "dundee", "inverness", "cardiff", "swansea", "newport",
  "belfast", "londonderry", "lisburn",
];

// ── Source URL patterns ───────────────────────────────────────────────────────
interface SourceDef {
  name: string;
  pattern: string;
  category: string;
}

const SOURCES: SourceDef[] = [
  // Directories
  { name: "Yell", pattern: "https://www.yell.com/s/{industry}/{region}/", category: "directory" },
  { name: "Thomson Local", pattern: "https://www.thomsonlocal.com/search/{industry}/{region}", category: "directory" },
  { name: "FreeIndex", pattern: "https://www.freeindex.co.uk/search/?q={industry}&l={region}", category: "directory" },
  { name: "Scoot", pattern: "https://www.scoot.co.uk/find/{industry}/{region}", category: "directory" },
  { name: "Cylex UK", pattern: "https://www.cylex.co.uk/{industry}/{region}.html", category: "directory" },
  { name: "Hotfrog UK", pattern: "https://www.hotfrog.co.uk/search/uk/{region}/{industry}", category: "directory" },
  { name: "Brownbook", pattern: "https://www.brownbook.net/businesses/{industry}/{region}", category: "directory" },
  // Trade platforms
  { name: "Checkatrade", pattern: "https://www.checkatrade.com/search?q={industry}&location={region}", category: "trade" },
  { name: "TrustATrader", pattern: "https://www.trustatrader.com/traders/{industry}/{region}", category: "trade" },
  { name: "Bark.com", pattern: "https://www.bark.com/en/gb/company/{industry}/{region}/", category: "trade" },
  { name: "Houzz UK", pattern: "https://www.houzz.co.uk/professionals/{industry}/{region}", category: "trade" },
  // Registers (region-only)
  { name: "NHS GP", pattern: "https://www.nhs.uk/service-search/find-a-gp/results/{region}", category: "register" },
  { name: "Ofsted", pattern: "https://reports.ofsted.gov.uk/search?q=&location={region}&radius=25", category: "register" },
  { name: "Law Society", pattern: "https://solicitors.lawsociety.org.uk/search/results?Type=1&location={region}", category: "register" },
  // Chambers (fixed)
  { name: "London Chamber", pattern: "https://directory.londonchamber.co.uk/members", category: "chamber" },
  { name: "GM Chamber", pattern: "https://www.gmchamber.co.uk/directory/", category: "chamber" },
  { name: "Birmingham Chamber", pattern: "https://www.birmingham-chamber.com/directory/", category: "chamber" },
  { name: "Scottish Chambers", pattern: "https://www.scottishchambers.org.uk/member-directory/", category: "chamber" },
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
]);

const JUNK_PREFIXES = new Set([
  "noreply", "no-reply", "donotreply", "do-not-reply",
  "postmaster", "mailer-daemon", "bounce", "unsubscribe",
  "admin", "webmaster", "hostmaster", "abuse",
]);

const EMAIL_REGEX = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;

function isValidEmail(email: string): boolean {
  if (!email || !email.includes("@") || email.length < 6) return false;
  const [local, domain] = email.split("@");
  if (JUNK_DOMAINS.has(domain)) return false;
  if (JUNK_PREFIXES.has(local.toLowerCase())) return false;
  if (!domain.includes(".")) return false;
  if (/\.(png|jpg|gif|css|js|svg|ico|woff)$/.test(domain)) return false;
  return true;
}

// ── URL builder ───────────────────────────────────────────────────────────────
function buildBatchUrls(cycleIndex: number, batchSize: number): { url: string; source: string; industry: string; region: string }[] {
  const urls: { url: string; source: string; industry: string; region: string }[] = [];

  // Pick a slice of industries and regions based on cycle
  for (let i = 0; i < batchSize; i++) {
    const idx = (cycleIndex * batchSize + i);
    const indIdx = idx % UK_INDUSTRIES.length;
    const regIdx = Math.floor(idx / UK_INDUSTRIES.length) % UK_REGIONS.length;
    const srcIdx = Math.floor(idx / (UK_INDUSTRIES.length * UK_REGIONS.length)) % SOURCES.length;

    const src = SOURCES[srcIdx];
    const industry = UK_INDUSTRIES[indIdx];
    const region = UK_REGIONS[regIdx];

    let url = src.pattern;
    if (url.includes("{industry}")) url = url.replace("{industry}", industry);
    if (url.includes("{region}")) url = url.replace("{region}", region);

    urls.push({ url, source: src.name, industry, region });
  }

  return urls;
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
    const batchSize = body.batch_size ?? 8;

    const batch = buildBatchUrls(cycleIndex, batchSize);
    console.log(`UK scraper: processing ${batch.length} URLs from cycle ${cycleIndex}`);

    let totalLeads = 0;

    const results = await Promise.all(
      batch.map(async ({ url, source, industry, region }) => {
        try {
          // Scrape page with Firecrawl
          const fcRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url, formats: ["markdown"], timeout: 15000 }),
          });

          if (!fcRes.ok) return 0;
          const fcData = await fcRes.json();
          const content = fcData.data?.markdown || "";
          if (!content || content.length < 50) return 0;

          // Use AI to extract leads from the page content
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
                  content: `You extract business leads from UK directory/listing pages. For each business or person found, extract:
- email (primary target - look for mailto: links and visible emails)
- full_name (contact person if visible)
- company (business name)
- phone (UK format)
- job_title (if visible)
- address (with UK postcode if available)

IMPORTANT: Filter out junk emails (noreply, admin, support, webmaster). Only return real business/person emails.
Source: ${source} | Industry: ${industry} | Region: ${region}`,
                },
                {
                  role: "user",
                  content: `Extract ALL business leads from this ${source} page for ${industry} in ${region}:\n\n${content.substring(0, 25000)}`,
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

          // Transform and filter
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

          // Upsert to DB
          if (dbLeads.length > 0) {
            const { error } = await supabase
              .from("leads")
              .upsert(dbLeads, { onConflict: "email" });
            if (error) console.error(`DB error for ${url}:`, error.message);
          }

          return dbLeads.length;
        } catch (e) {
          console.error(`Error scraping ${url}:`, e);
          return 0;
        }
      })
    );

    totalLeads = results.reduce((a, b) => a + b, 0);

    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    console.log(`UK scraper done: ${totalLeads} leads from ${batch.length} URLs, ${count} total in DB`);

    return new Response(
      JSON.stringify({
        success: true,
        leads_found: totalLeads,
        total_in_db: count || 0,
        urls_scraped: batch.length,
        sources: [...new Set(batch.map((b) => b.source))],
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

function inferSeniority(title: string): string {
  const t = title.toLowerCase();
  if (/\b(ceo|cto|cfo|coo|founder|chief|president|owner|proprietor|principal)\b/.test(t)) return "C-Level";
  if (/\b(director|head of)\b/.test(t)) return "Director";
  if (/\b(manager|lead|team lead|supervisor)\b/.test(t)) return "Manager";
  if (/\b(partner|associate)\b/.test(t)) return "Senior";
  return "Individual Contributor";
}
