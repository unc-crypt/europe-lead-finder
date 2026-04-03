import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Comprehensive list of roles and industries to scrape
const ROLES = [
  "doctor", "lawyer", "engineer", "architect", "accountant", "dentist",
  "pharmacist", "consultant", "professor", "researcher", "analyst",
  "designer", "developer", "manager", "director", "CEO", "CTO", "CFO",
  "marketing", "sales", "HR", "recruiter", "nurse", "surgeon",
  "veterinarian", "psychologist", "therapist", "teacher", "journalist",
  "photographer", "real estate agent", "financial advisor", "broker",
  "chef", "pilot", "mechanic", "electrician", "plumber",
];

// European domains to target
const EU_DOMAINS = [
  // Germany
  "gmx.de", "web.de", "t-online.de", "freenet.de", "arcor.de",
  // France
  "orange.fr", "free.fr", "wanadoo.fr", "sfr.fr", "laposte.net",
  // Italy
  "libero.it", "virgilio.it", "tin.it", "alice.it", "tiscali.it",
  // Spain
  "terra.es", "telefonica.net", "ya.com",
  // Netherlands
  "planet.nl", "kpnmail.nl", "hetnet.nl", "xs4all.nl",
  // Poland
  "wp.pl", "o2.pl", "interia.pl", "onet.pl", "gazeta.pl",
  // Bulgaria
  "abv.bg", "mail.bg", "dir.bg",
  // Czech Republic
  "seznam.cz", "centrum.cz", "volny.cz",
  // Romania
  "yahoo.ro", "rdslink.ro",
  // Austria
  "gmx.at", "aon.at", "chello.at",
  // Sweden
  "telia.com", "bredband.net", "spray.se",
  // UK
  "btinternet.com", "sky.com", "virgin.net", "talktalk.net",
  // Switzerland
  "bluewin.ch", "gmx.ch",
  // Generic European
  "gmail.com", "outlook.com", "yahoo.com", "hotmail.com",
];

const EU_COUNTRIES = [
  "Germany", "France", "Italy", "Spain", "Netherlands", "Poland",
  "Bulgaria", "Czech Republic", "Romania", "Austria", "Sweden",
  "Belgium", "Portugal", "Switzerland", "Denmark", "Norway",
  "Finland", "Ireland", "Greece", "Hungary", "Croatia",
  "United Kingdom", "Slovakia", "Slovenia", "Lithuania", "Latvia",
  "Estonia", "Luxembourg", "Malta", "Cyprus",
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
    const batchSize = body.batch_size || 5; // Number of search combos per run
    const targetRole = body.role || ROLES[Math.floor(Math.random() * ROLES.length)];
    const targetCountry = body.country || EU_COUNTRIES[Math.floor(Math.random() * EU_COUNTRIES.length)];
    const targetDomain = body.domain || EU_DOMAINS[Math.floor(Math.random() * EU_DOMAINS.length)];

    console.log(`Bulk scrape: role=${targetRole}, country=${targetCountry}, domain=${targetDomain}`);

    const queries = [
      `"${targetRole}" "@${targetDomain}" email`,
      `"${targetRole}" ${targetCountry} email contact directory`,
      `"${targetRole}" ${targetCountry} site:linkedin.com/in`,
      `"${targetRole}" "@${targetDomain}" professional`,
      `"${targetRole}" ${targetCountry} "${targetDomain}" contact list`,
    ].slice(0, batchSize);

    // Run all searches in parallel
    const searchPromises = queries.map(async (q) => {
      try {
        const response = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: q,
            limit: 10,
            scrapeOptions: { formats: ["markdown"] },
          }),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.data || [];
      } catch {
        return [];
      }
    });

    const results = await Promise.all(searchPromises);
    const allResults = results.flat();

    if (allResults.length === 0) {
      return new Response(
        JSON.stringify({ success: true, leads_found: 0, message: "No results" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract with AI
    const content = allResults
      .map((r: any) => {
        const parts = [];
        if (r.title) parts.push(`Title: ${r.title}`);
        if (r.description) parts.push(`Desc: ${r.description}`);
        if (r.url) parts.push(`URL: ${r.url}`);
        if (r.markdown) parts.push(`Content: ${r.markdown.substring(0, 2000)}`);
        return parts.join("\n");
      })
      .join("\n---\n")
      .substring(0, 25000);

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
            content: `Extract EVERY professional contact from web content. Be thorough. Include anyone with a name and potential email. Generate professional emails from name+domain when you see company info.`,
          },
          {
            role: "user",
            content: `Extract leads for "${targetRole}" in "${targetCountry}". Domain hint: "${targetDomain}".\n\n${content}`,
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

    let leadsFound = 0;

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const parsed = JSON.parse(toolCall.function.arguments);
        const leads = (parsed.leads || [])
          .filter((l: any) => l.email && l.first_name)
          .map((l: any) => ({
            first_name: l.first_name,
            last_name: l.last_name || "Unknown",
            title: l.title || targetRole,
            company: l.company || "Unknown",
            email: l.email,
            phone: l.phone || "",
            country: l.country || targetCountry,
            domain: l.domain || l.email.split("@")[1] || targetDomain,
            industry: l.industry || "General",
            company_size: "Unknown",
            seniority: inferSeniority(l.title || targetRole),
            verified: "likely",
            confidence: 60,
            linkedin_url: l.linkedin_url || "",
          }));

        // Deduplicate
        const seen = new Set<string>();
        const unique = leads.filter((l: any) => {
          const key = l.email.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (unique.length > 0) {
          const { error } = await supabase
            .from("leads")
            .upsert(unique, { onConflict: "email" });
          if (error) console.error("DB error:", error.message);
          else leadsFound = unique.length;
        }
      }
    }

    // Get total count
    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    return new Response(
      JSON.stringify({
        success: true,
        leads_found: leadsFound,
        total_in_db: count || 0,
        role: targetRole,
        country: targetCountry,
        domain: targetDomain,
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
