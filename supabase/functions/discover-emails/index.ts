import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Common email patterns used by companies
const EMAIL_PATTERNS = [
  (f: string, l: string, d: string) => `${f}.${l}@${d}`,
  (f: string, l: string, d: string) => `${f}${l}@${d}`,
  (f: string, l: string, d: string) => `${f[0]}${l}@${d}`,
  (f: string, l: string, d: string) => `${f}@${d}`,
  (f: string, l: string, d: string) => `${f[0]}.${l}@${d}`,
  (f: string, l: string, d: string) => `${l}.${f}@${d}`,
  (f: string, l: string, d: string) => `${l}${f[0]}@${d}`,
  (f: string, l: string, d: string) => `${f}_${l}@${d}`,
  (f: string, l: string, d: string) => `${f}-${l}@${d}`,
];

// Top European company domains to scrape
const EU_COMPANY_DOMAINS = [
  // Germany
  "siemens.com", "bosch.com", "bmw.com", "daimler.com", "sap.com", "basf.com",
  "allianz.com", "telekom.de", "bayer.com", "henkel.com", "continental.com",
  "thyssenkrupp.com", "fresenius.com", "merck.com", "infineon.com",
  // France
  "loreal.com", "totalenergies.com", "bnpparibas.com", "axa.com", "sanofi.com",
  "danone.com", "michelin.com", "capgemini.com", "renault.com", "airbus.com",
  "schneider-electric.com", "saint-gobain.com", "pernod-ricard.com",
  // UK
  "bp.com", "shell.com", "hsbc.com", "unilever.com", "gsk.com", "astrazeneca.com",
  "bt.com", "vodafone.com", "barclays.com", "rolls-royce.com", "bae-systems.com",
  // Italy
  "eni.com", "enel.com", "intesasanpaolo.com", "luxottica.com", "pirelli.com",
  "ferrero.com", "prada.com", "telecomitalia.com",
  // Spain
  "telefonica.com", "santander.com", "bbva.com", "inditex.com", "repsol.com",
  "iberdrola.com", "caixabank.com",
  // Netherlands
  "philips.com", "asml.com", "heineken.com", "ing.com", "aegon.com", "akzonobel.com",
  // Switzerland
  "nestle.com", "novartis.com", "roche.com", "abb.com", "zurich.com", "ubs.com",
  // Nordics
  "ericsson.com", "volvo.com", "ikea.com", "spotify.com", "nokia.com",
  "equinor.com", "maersk.com", "carlsberg.com", "lego.com",
  // Others
  "orlen.pl", "pkobp.pl", "erste-group.com", "omv.com", "kbc.com",
];

// Pages to scrape on company websites
const TARGET_PAGES = [
  "/about", "/about-us", "/team", "/our-team", "/leadership", "/management",
  "/people", "/staff", "/contact", "/contact-us", "/impressum", "/imprint",
  "/company/team", "/company/about", "/about/leadership", "/about/team",
  "/en/about", "/en/team", "/en/contact", "/careers/team",
];

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
    const cycleIndex = body.cycle_index ?? Math.floor(Date.now() / 1000);

    // Pick 5 company domains to scrape
    const domains: string[] = [];
    for (let i = 0; i < 5; i++) {
      domains.push(EU_COMPANY_DOMAINS[(cycleIndex + i * 13) % EU_COMPANY_DOMAINS.length]);
    }

    console.log(`Discover emails: scraping ${domains.join(", ")}`);

    let totalLeads = 0;

    // Process each domain
    const domainPromises = domains.map(async (domain) => {
      // Pick 3 random target pages per domain
      const pages = TARGET_PAGES
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Scrape pages using Firecrawl
      const scrapePromises = pages.map(async (page) => {
        try {
          const url = `https://www.${domain}${page}`;
          const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url,
              formats: ["markdown"],
              timeout: 15000,
            }),
          });
          if (!response.ok) return null;
          const data = await response.json();
          return data.data?.markdown || null;
        } catch {
          return null;
        }
      });

      // Also search for company employees
      const searchPromise = fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `site:${domain} team OR staff OR leadership OR management email`,
          limit: 10,
        }),
      }).then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] }));

      const [scraped, searchData] = await Promise.all([
        Promise.all(scrapePromises),
        searchPromise,
      ]);

      const allContent = [
        ...scraped.filter(Boolean),
        ...(searchData.data || []).map((r: any) => {
          const parts = [];
          if (r.title) parts.push(r.title);
          if (r.description) parts.push(r.description);
          if (r.markdown) parts.push(r.markdown.substring(0, 2000));
          return parts.join("\n");
        }),
      ].join("\n---\n").substring(0, 30000);

      if (!allContent || allContent.length < 50) return 0;

      // Use AI to extract people from the content
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: `You extract people/employee data from company web pages. For each person found:
1. Extract their full name, job title, department
2. Look for any email addresses shown on the page
3. Look for phone numbers, LinkedIn URLs
4. Extract every person mentioned - even if only a name and title are visible
The company domain is "${domain}" - this is crucial for generating emails later.`,
            },
            {
              role: "user",
              content: `Extract ALL people from this ${domain} content:\n\n${allContent}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_people",
                parameters: {
                  type: "object",
                  properties: {
                    people: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          first_name: { type: "string" },
                          last_name: { type: "string" },
                          title: { type: "string" },
                          department: { type: "string" },
                          email: { type: "string" },
                          phone: { type: "string" },
                          linkedin_url: { type: "string" },
                        },
                        required: ["first_name", "last_name"],
                      },
                    },
                  },
                  required: ["people"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "extract_people" } },
        }),
      });

      if (!aiResponse.ok) return 0;

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) return 0;

      const parsed = JSON.parse(toolCall.function.arguments);
      const people = parsed.people || [];

      // Generate email variants for each person
      const leads: any[] = [];
      for (const p of people) {
        if (!p.first_name || !p.last_name) continue;
        const f = p.first_name.toLowerCase().replace(/[^a-z]/g, "");
        const l = p.last_name.toLowerCase().replace(/[^a-z]/g, "");
        if (!f || !l) continue;

        // If email was found on the page, use it directly
        if (p.email && p.email.includes("@")) {
          leads.push({
            first_name: p.first_name,
            last_name: p.last_name,
            title: p.title || "Professional",
            company: domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1),
            email: p.email.toLowerCase().trim(),
            phone: p.phone || "",
            country: inferCountryFromDomain(domain),
            domain: domain,
            industry: "Corporate",
            company_size: "Enterprise",
            seniority: inferSeniority(p.title || ""),
            verified: "verified",
            confidence: 90,
            linkedin_url: p.linkedin_url || "",
          });
        }

        // Generate pattern-based emails
        const patterns = EMAIL_PATTERNS.slice(0, 4); // Top 4 most common patterns
        for (const pattern of patterns) {
          try {
            const email = pattern(f, l, domain);
            leads.push({
              first_name: p.first_name,
              last_name: p.last_name,
              title: p.title || "Professional",
              company: domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1),
              email,
              phone: p.phone || "",
              country: inferCountryFromDomain(domain),
              domain: domain,
              industry: "Corporate",
              company_size: "Enterprise",
              seniority: inferSeniority(p.title || ""),
              verified: "likely",
              confidence: 70,
              linkedin_url: p.linkedin_url || "",
            });
          } catch { /* skip invalid */ }
        }
      }

      // Deduplicate by email
      const seen = new Set<string>();
      const unique = leads.filter((l) => {
        if (seen.has(l.email)) return false;
        seen.add(l.email);
        return true;
      });

      if (unique.length > 0) {
        for (let i = 0; i < unique.length; i += 100) {
          const chunk = unique.slice(i, i + 100);
          const { error } = await supabase
            .from("leads")
            .upsert(chunk, { onConflict: "email" });
          if (error) console.error("DB error:", error.message);
        }
      }

      return unique.length;
    });

    const results = await Promise.all(domainPromises);
    totalLeads = results.reduce((a, b) => a + b, 0);

    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    console.log(`Discover emails done: ${totalLeads} leads from ${domains.length} domains, ${count} total`);

    return new Response(
      JSON.stringify({
        success: true,
        leads_found: totalLeads,
        total_in_db: count || 0,
        domains_scraped: domains,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Discover emails error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function inferCountryFromDomain(domain: string): string {
  if (domain.endsWith(".de")) return "Germany";
  if (domain.endsWith(".fr")) return "France";
  if (domain.endsWith(".it")) return "Italy";
  if (domain.endsWith(".es")) return "Spain";
  if (domain.endsWith(".nl")) return "Netherlands";
  if (domain.endsWith(".pl")) return "Poland";
  if (domain.endsWith(".se")) return "Sweden";
  if (domain.endsWith(".no")) return "Norway";
  if (domain.endsWith(".dk")) return "Denmark";
  if (domain.endsWith(".fi")) return "Finland";
  if (domain.endsWith(".at")) return "Austria";
  if (domain.endsWith(".ch")) return "Switzerland";
  if (domain.endsWith(".be")) return "Belgium";
  if (domain.endsWith(".pt")) return "Portugal";
  if (domain.endsWith(".co.uk") || domain.endsWith(".uk")) return "United Kingdom";
  return "Europe";
}

function inferSeniority(title: string): string {
  const t = title.toLowerCase();
  if (/\b(ceo|cto|cfo|coo|cio|founder|chief|president|owner)\b/.test(t)) return "C-Level";
  if (/\b(vp|vice president)\b/.test(t)) return "VP";
  if (/\b(director|head of)\b/.test(t)) return "Director";
  if (/\b(manager|lead|team lead)\b/.test(t)) return "Manager";
  return "Individual Contributor";
}
