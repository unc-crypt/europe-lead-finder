import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// European professional directories and registries to scrape
const DIRECTORIES = [
  // Doctor directories
  { url: "https://www.doctolib.fr/medecin-generaliste", country: "France", role: "Doctor" },
  { url: "https://www.doctolib.de/allgemeinmedizin", country: "Germany", role: "Doctor" },
  { url: "https://www.jameda.de/aerzte/allgemeinmediziner-hausarzt/fachgebiet/", country: "Germany", role: "Doctor" },
  { url: "https://www.miodottore.it/medico-di-base", country: "Italy", role: "Doctor" },
  { url: "https://www.doctoralia.es/medico-de-familia", country: "Spain", role: "Doctor" },
  // Lawyer directories
  { url: "https://www.anwalt.de/rechtsanwaelte/", country: "Germany", role: "Lawyer" },
  { url: "https://www.avocats.fr/annuaire", country: "France", role: "Lawyer" },
  { url: "https://www.solicitors.guru/", country: "United Kingdom", role: "Lawyer" },
  // Business directories
  { url: "https://www.europages.com/companies/germany.html", country: "Germany", role: "Business" },
  { url: "https://www.europages.com/companies/france.html", country: "France", role: "Business" },
  { url: "https://www.europages.com/companies/italy.html", country: "Italy", role: "Business" },
  { url: "https://www.europages.com/companies/spain.html", country: "Spain", role: "Business" },
  { url: "https://www.europages.com/companies/united-kingdom.html", country: "United Kingdom", role: "Business" },
  { url: "https://www.europages.com/companies/netherlands.html", country: "Netherlands", role: "Business" },
  { url: "https://www.europages.com/companies/poland.html", country: "Poland", role: "Business" },
  { url: "https://www.europages.com/companies/belgium.html", country: "Belgium", role: "Business" },
  { url: "https://www.europages.com/companies/switzerland.html", country: "Switzerland", role: "Business" },
  { url: "https://www.europages.com/companies/austria.html", country: "Austria", role: "Business" },
  // Real estate
  { url: "https://www.immobilienscout24.de/", country: "Germany", role: "Real Estate Agent" },
  { url: "https://www.seloger.com/", country: "France", role: "Real Estate Agent" },
  // Accountant/Finance
  { url: "https://www.datev.de/web/de/m/ueber-datev/datev-im-web/steuerberater-suche/", country: "Germany", role: "Accountant" },
  // Engineering
  { url: "https://www.ingenieur.de/", country: "Germany", role: "Engineer" },
  // Architect
  { url: "https://www.bak.de/architekten/architektenliste/", country: "Germany", role: "Architect" },
];

// Search queries targeting professional directories
const DIRECTORY_SEARCHES = [
  (role: string, country: string) => `${role} directory ${country} contact email list`,
  (role: string, country: string) => `"${role}" ${country} professional association members`,
  (role: string, country: string) => `${role} ${country} register list email phone`,
  (role: string, country: string) => `${role} ${country} chamber members directory`,
  (role: string, country: string) => `${role} ${country} yellow pages business listing`,
  (role: string, country: string) => `"${role}" "${country}" staff directory email`,
  (role: string, country: string) => `${role} association ${country} annual report members`,
  (role: string, country: string) => `${role} ${country} business register company email`,
];

const ROLES_TO_SEARCH = [
  "doctor", "lawyer", "dentist", "accountant", "architect", "engineer",
  "pharmacist", "veterinarian", "real estate agent", "financial advisor",
  "consultant", "psychologist", "physiotherapist", "optician", "notary",
  "insurance broker", "tax advisor", "auditor", "surveyor", "translator",
];

const COUNTRIES = [
  "Germany", "France", "Italy", "Spain", "United Kingdom", "Netherlands",
  "Poland", "Belgium", "Switzerland", "Austria", "Sweden", "Denmark",
  "Norway", "Finland", "Ireland", "Portugal", "Greece", "Czech Republic",
  "Romania", "Hungary", "Croatia", "Bulgaria", "Slovakia", "Slovenia",
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

    // Strategy 1: Scrape actual directory pages
    const dirIndex = cycleIndex % DIRECTORIES.length;
    const selectedDirs = [];
    for (let i = 0; i < 3; i++) {
      selectedDirs.push(DIRECTORIES[(dirIndex + i) % DIRECTORIES.length]);
    }

    // Strategy 2: Search for directory listings
    const roleIdx = cycleIndex % ROLES_TO_SEARCH.length;
    const countryIdx = Math.floor(cycleIndex / ROLES_TO_SEARCH.length) % COUNTRIES.length;
    const role = ROLES_TO_SEARCH[roleIdx];
    const country = COUNTRIES[countryIdx];

    console.log(`Scrape directories: ${selectedDirs.map(d => d.url).join(", ")} + search ${role}/${country}`);

    // Scrape directory pages
    const scrapePromises = selectedDirs.map(async (dir) => {
      try {
        const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: dir.url,
            formats: ["markdown"],
            timeout: 20000,
          }),
        });
        if (!response.ok) return { content: "", meta: dir };
        const data = await response.json();
        return { content: data.data?.markdown || "", meta: dir };
      } catch {
        return { content: "", meta: dir };
      }
    });

    // Search for directory listings
    const searchQueries = DIRECTORY_SEARCHES
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map(fn => fn(role, country));

    const searchPromises = searchQueries.map(async (query) => {
      try {
        const response = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, limit: 10 }),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.data || [];
      } catch {
        return [];
      }
    });

    const [scrapeResults, ...searchResults] = await Promise.all([
      Promise.all(scrapePromises),
      ...searchPromises,
    ]);

    let totalLeads = 0;

    // Process scraped directory pages
    const dirContentPromises = scrapeResults.map(async (result: any) => {
      if (!result.content || result.content.length < 100) return 0;

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
              content: `You are scraping a professional directory page. Extract EVERY professional listed with their contact info. Look for:
- Names, titles, specializations
- Email addresses (look for mailto: links, @ symbols, obfuscated emails like "name [at] domain [dot] com")
- Phone numbers (with country codes)
- Addresses, clinic/office names
- Any URLs (LinkedIn, personal websites)
Be thorough - extract EVERY person listed, even with partial data.`,
            },
            {
              role: "user",
              content: `Extract all ${result.meta.role} professionals from this ${result.meta.country} directory page:\n\n${result.content.substring(0, 25000)}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_leads",
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

      if (!aiResponse.ok) return 0;
      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) return 0;

      const parsed = JSON.parse(toolCall.function.arguments);
      return await insertLeads(supabase, parsed.leads || [], result.meta.country, result.meta.role);
    });

    // Process search results
    const allSearchContent = searchResults
      .flat()
      .map((r: any) => {
        const parts = [];
        if (r.title) parts.push(`Title: ${r.title}`);
        if (r.description) parts.push(`Desc: ${r.description}`);
        if (r.url) parts.push(`URL: ${r.url}`);
        if (r.markdown) parts.push(`Content: ${r.markdown.substring(0, 1500)}`);
        return parts.join("\n");
      })
      .join("\n---\n")
      .substring(0, 25000);

    const searchExtractPromise = (async () => {
      if (!allSearchContent || allSearchContent.length < 100) return 0;

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
              content: `Extract ALL professional contacts from search results. For each person, get name, email, phone, title, company. Generate plausible emails if you see a name + company domain. Be aggressive - quantity matters.`,
            },
            {
              role: "user",
              content: `Extract all "${role}" leads in "${country}" from these search results:\n\n${allSearchContent}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_leads",
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

      if (!aiResponse.ok) return 0;
      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) return 0;

      const parsed = JSON.parse(toolCall.function.arguments);
      return await insertLeads(supabase, parsed.leads || [], country, role);
    })();

    const allResults = await Promise.all([...dirContentPromises, searchExtractPromise]);
    totalLeads = allResults.reduce((a, b) => a + b, 0);

    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    console.log(`Directory scrape done: ${totalLeads} leads, ${count} total`);

    return new Response(
      JSON.stringify({
        success: true,
        leads_found: totalLeads,
        total_in_db: count || 0,
        directories_scraped: selectedDirs.map(d => d.url),
        search_role: role,
        search_country: country,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Directory scrape error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function insertLeads(supabase: any, leads: any[], defaultCountry: string, defaultRole: string): Promise<number> {
  const processed = leads
    .filter((l: any) => l.email && l.first_name)
    .map((l: any) => ({
      first_name: l.first_name,
      last_name: l.last_name || "Unknown",
      title: l.title || defaultRole,
      company: l.company || "Unknown",
      email: l.email.toLowerCase().trim(),
      phone: l.phone || "",
      country: l.country || defaultCountry,
      domain: l.domain || l.email.split("@")[1] || "",
      industry: l.industry || "General",
      company_size: "Unknown",
      seniority: inferSeniority(l.title || defaultRole),
      verified: "likely",
      confidence: 65,
      linkedin_url: l.linkedin_url || "",
    }));

  const seen = new Set<string>();
  const unique = processed.filter((l: any) => {
    if (seen.has(l.email)) return false;
    seen.add(l.email);
    return true;
  });

  if (unique.length === 0) return 0;

  for (let i = 0; i < unique.length; i += 100) {
    const chunk = unique.slice(i, i + 100);
    const { error } = await supabase
      .from("leads")
      .upsert(chunk, { onConflict: "email" });
    if (error) console.error("DB error:", error.message);
  }

  return unique.length;
}

function inferSeniority(title: string): string {
  const t = title.toLowerCase();
  if (/\b(ceo|cto|cfo|coo|cio|founder|chief|president|owner)\b/.test(t)) return "C-Level";
  if (/\b(vp|vice president)\b/.test(t)) return "VP";
  if (/\b(director|head of)\b/.test(t)) return "Director";
  if (/\b(manager|lead|team lead)\b/.test(t)) return "Manager";
  return "Individual Contributor";
}
