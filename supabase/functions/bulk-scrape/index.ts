import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// 50+ professional roles
const ROLES = [
  "doctor", "lawyer", "engineer", "architect", "accountant", "dentist",
  "pharmacist", "consultant", "professor", "researcher", "analyst",
  "designer", "developer", "manager", "director", "CEO", "CTO", "CFO",
  "marketing manager", "sales manager", "HR manager", "recruiter",
  "nurse", "surgeon", "veterinarian", "psychologist", "therapist",
  "teacher", "journalist", "photographer", "real estate agent",
  "financial advisor", "broker", "chef", "pilot", "mechanic",
  "electrician", "plumber", "data scientist", "product manager",
  "project manager", "business analyst", "supply chain manager",
  "logistics manager", "procurement manager", "quality manager",
  "operations manager", "investment banker", "auditor", "tax advisor",
  "patent attorney", "notary", "insurance agent", "travel agent",
  "interior designer", "graphic designer", "web developer",
  "software engineer", "systems administrator", "network engineer",
  "security analyst", "compliance officer", "risk manager",
];

// 130+ European domains
const EU_DOMAINS = [
  "gmx.de", "web.de", "t-online.de", "freenet.de", "arcor.de", "posteo.de",
  "orange.fr", "free.fr", "wanadoo.fr", "sfr.fr", "laposte.net",
  "libero.it", "virgilio.it", "tin.it", "alice.it", "tiscali.it", "fastwebnet.it",
  "terra.es", "telefonica.net", "ya.com", "ono.com",
  "planet.nl", "kpnmail.nl", "hetnet.nl", "xs4all.nl", "ziggo.nl",
  "wp.pl", "o2.pl", "interia.pl", "onet.pl", "gazeta.pl", "poczta.fm",
  "abv.bg", "mail.bg", "dir.bg", "gbg.bg",
  "seznam.cz", "centrum.cz", "volny.cz", "email.cz",
  "yahoo.ro", "rdslink.ro", "clicknet.ro",
  "gmx.at", "aon.at", "chello.at", "a1.net",
  "telia.com", "bredband.net", "spray.se", "comhem.se",
  "btinternet.com", "sky.com", "virgin.net", "talktalk.net", "btopenworld.com",
  "bluewin.ch", "gmx.ch", "sunrise.ch",
  "sapo.pt", "clix.pt", "iol.pt", "netcabo.pt",
  "skynet.be", "telenet.be", "proximus.be",
  "otenet.gr", "forthnet.gr", "hol.gr",
  "freemail.hu", "citromail.hu", "indamail.hu",
  "net.hr", "globalnet.hr",
  "siol.net", "volja.net",
  "post.sk", "azet.sk", "centrum.sk",
  "inbox.lt", "one.lt", "takas.lt",
  "inbox.lv", "apollo.lv", "one.lv",
  "hot.ee", "mail.ee",
  "pt.lu", "internet.lu",
  "go.com.mt", "onvol.net",
  "cytanet.com.cy", "logos.cy.net",
  "mail.dk", "jubii.dk", "tdcadsl.dk",
  "online.no", "broadpark.no", "frisurf.no",
  "kolumbus.fi", "welho.com", "saunalahti.fi",
  "eircom.net", "iolfree.ie",
  "gmail.com", "outlook.com", "yahoo.com", "hotmail.com",
  "hotmail.co.uk", "hotmail.fr", "hotmail.de", "hotmail.it",
  "yahoo.co.uk", "yahoo.fr", "yahoo.de", "yahoo.it",
  "outlook.de", "outlook.fr", "outlook.it",
  "live.co.uk", "live.fr", "live.de", "live.it",
];

const EU_COUNTRIES = [
  "Germany", "France", "Italy", "Spain", "Netherlands", "Poland",
  "Bulgaria", "Czech Republic", "Romania", "Austria", "Sweden",
  "Belgium", "Portugal", "Switzerland", "Denmark", "Norway",
  "Finland", "Ireland", "Greece", "Hungary", "Croatia",
  "United Kingdom", "Slovakia", "Slovenia", "Lithuania", "Latvia",
  "Estonia", "Luxembourg", "Malta", "Cyprus", "Serbia",
  "Bosnia and Herzegovina", "Montenegro", "North Macedonia", "Albania",
  "Moldova", "Ukraine", "Iceland", "Liechtenstein", "Monaco",
  "Andorra", "San Marino", "Turkey", "Georgia",
];

// Directory and association sites to target
const DIRECTORY_SITES = [
  "linkedin.com/in", "xing.com/profile", "europages.com",
  "kompass.com", "yellowpages", "whitepages",
  "doctolib.fr", "jameda.de", "miodottore.it", "doctoralia.es",
  "anwalt.de", "avvocatoflash.it", "avocats.fr",
  "stayfriends.de", "viadeo.com",
];

// Search query templates for maximum coverage
const QUERY_TEMPLATES = [
  (role: string, country: string, domain: string) =>
    `"${role}" "@${domain}" email`,
  (role: string, country: string, domain: string) =>
    `"${role}" ${country} email contact`,
  (role: string, country: string, domain: string) =>
    `"${role}" ${country} site:linkedin.com/in`,
  (role: string, country: string, domain: string) =>
    `"${role}" "@${domain}" professional directory`,
  (role: string, country: string, domain: string) =>
    `"${role}" ${country} "${domain}" staff team`,
  (role: string, country: string, domain: string) =>
    `"${role}" ${country} contact list email phone`,
  (role: string, country: string, domain: string) =>
    `"${role}" email list ${country} 2024 2025`,
  (role: string, country: string, domain: string) =>
    `site:europages.com "${role}" ${country} email`,
  (role: string, country: string, domain: string) =>
    `"${role}" association ${country} members directory`,
  (role: string, country: string, domain: string) =>
    `"${role}" "${country}" filetype:csv OR filetype:xlsx email`,
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
    
    // Deterministic cycling: use timestamp to cycle through combos
    const now = Date.now();
    const cycleIndex = body.cycle_index ?? Math.floor(now / 1000);
    
    // Pick 3 different role/country/domain combos per invocation
    const combos = [];
    for (let i = 0; i < 3; i++) {
      const idx = cycleIndex + i * 7919; // prime number for better distribution
      combos.push({
        role: ROLES[idx % ROLES.length],
        country: EU_COUNTRIES[Math.floor(idx / ROLES.length) % EU_COUNTRIES.length],
        domain: EU_DOMAINS[Math.floor(idx / (ROLES.length * EU_COUNTRIES.length)) % EU_DOMAINS.length],
      });
    }

    console.log(`Bulk scrape: ${combos.length} combos starting with ${combos[0].role}/${combos[0].country}/${combos[0].domain}`);

    // Generate all search queries across all combos
    const allQueries: { query: string; role: string; country: string; domain: string }[] = [];
    for (const combo of combos) {
      // Pick 3-4 random query templates per combo
      const templateIndices = Array.from({ length: QUERY_TEMPLATES.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      
      for (const ti of templateIndices) {
        allQueries.push({
          query: QUERY_TEMPLATES[ti](combo.role, combo.country, combo.domain),
          role: combo.role,
          country: combo.country,
          domain: combo.domain,
        });
      }
    }

    // Run all searches in parallel (up to 12 concurrent)
    const searchPromises = allQueries.map(async (q) => {
      try {
        const response = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: q.query, limit: 10 }),
        });
        if (!response.ok) return { results: [], meta: q };
        const data = await response.json();
        return { results: data.data || [], meta: q };
      } catch {
        return { results: [], meta: q };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    
    // Group results by combo for better AI extraction
    const comboResults = new Map<string, { results: any[]; role: string; country: string; domain: string }>();
    for (const sr of searchResults) {
      const key = `${sr.meta.role}|${sr.meta.country}|${sr.meta.domain}`;
      if (!comboResults.has(key)) {
        comboResults.set(key, { results: [], ...sr.meta });
      }
      comboResults.get(key)!.results.push(...sr.results);
    }

    let totalLeadsFound = 0;

    // Process each combo with AI in parallel
    const extractionPromises = Array.from(comboResults.values()).map(async (combo) => {
      if (combo.results.length === 0) return 0;

      const content = combo.results
        .map((r: any) => {
          const parts = [];
          if (r.title) parts.push(`Title: ${r.title}`);
          if (r.description) parts.push(`Desc: ${r.description}`);
          if (r.url) parts.push(`URL: ${r.url}`);
          if (r.markdown) parts.push(`Content: ${r.markdown.substring(0, 1500)}`);
          return parts.join("\n");
        })
        .join("\n---\n")
        .substring(0, 30000);

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
              content: `You are a lead extraction engine. Extract EVERY person/professional contact from the content. For each person found:
1. Extract their name, email, phone, title/role, company
2. If you see a company domain, generate plausible professional emails (firstname.lastname@domain, firstname@domain)
3. For LinkedIn profiles, extract all visible info
4. Be aggressive - extract even partial data. A name + domain is enough to generate an email.
5. Generate multiple email variants when possible (gmail, company domain, local ISP domain)
Return as many leads as possible. Quality matters less than quantity at this stage.`,
            },
            {
              role: "user",
              content: `Extract ALL leads for "${combo.role}" in "${combo.country}". Target domain: "${combo.domain}".\n\n${content}`,
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
      const leads = (parsed.leads || [])
        .filter((l: any) => l.email && l.first_name)
        .map((l: any) => ({
          first_name: l.first_name,
          last_name: l.last_name || "Unknown",
          title: l.title || combo.role,
          company: l.company || "Unknown",
          email: l.email.toLowerCase().trim(),
          phone: l.phone || "",
          country: l.country || combo.country,
          domain: l.domain || l.email.split("@")[1] || combo.domain,
          industry: l.industry || "General",
          company_size: "Unknown",
          seniority: inferSeniority(l.title || combo.role),
          verified: "likely",
          confidence: 60,
          linkedin_url: l.linkedin_url || "",
        }));

      // Deduplicate within batch
      const seen = new Set<string>();
      const unique = leads.filter((l: any) => {
        const key = l.email;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (unique.length > 0) {
        // Batch insert in chunks of 100
        for (let i = 0; i < unique.length; i += 100) {
          const chunk = unique.slice(i, i + 100);
          const { error } = await supabase
            .from("leads")
            .upsert(chunk, { onConflict: "email" });
          if (error) console.error("DB error:", error.message);
        }
        return unique.length;
      }
      return 0;
    });

    const results = await Promise.all(extractionPromises);
    totalLeadsFound = results.reduce((a, b) => a + b, 0);

    // Get total count
    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    console.log(`Scrape complete: ${totalLeadsFound} new leads, ${count} total`);

    return new Response(
      JSON.stringify({
        success: true,
        leads_found: totalLeadsFound,
        total_in_db: count || 0,
        combos_processed: combos.length,
        queries_run: allQueries.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Bulk scrape error:", error);
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
