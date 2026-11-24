import { authorizeRequest } from "../_shared/auth.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Source {
  name: string;
  urlPattern: string;
  category: string;
}

interface QueueItem {
  url: string;
  source: string;
  category: string;
  industry: string;
  region: string;
}

const UK_INDUSTRIES = [
  "accountants", "solicitors", "architects", "surveyors", "financial-advisors",
  "mortgage-brokers", "insurance-brokers", "recruitment-agencies", "marketing-agencies",
  "it-services", "dentists", "opticians", "physiotherapists", "builders", "plumbers",
  "electricians", "roofers", "restaurants", "hotels", "nurseries", "garages",
  "estate-agents", "letting-agents", "gyms", "beauty-salons", "hairdressers",
  "photographers", "cleaning-companies",
];

const UK_REGIONS = [
  "london", "manchester", "birmingham", "leeds", "sheffield", "liverpool",
  "bristol", "newcastle", "nottingham", "leicester", "brighton", "southampton",
  "oxford", "cambridge", "reading", "edinburgh", "glasgow", "cardiff", "belfast",
];

const SOURCES: Source[] = [
  { name: "Yell", urlPattern: "https://www.yell.com/s/{industry}/{region}/", category: "directory" },
  { name: "Thomson Local", urlPattern: "https://www.thomsonlocal.com/search/{industry}/{region}", category: "directory" },
  { name: "FreeIndex", urlPattern: "https://www.freeindex.co.uk/search/?q={industry}&l={region}", category: "directory" },
  { name: "Scoot", urlPattern: "https://www.scoot.co.uk/find/{industry}/{region}", category: "directory" },
  { name: "Cylex UK", urlPattern: "https://www.cylex.co.uk/{industry}/{region}.html", category: "directory" },
  { name: "Hotfrog UK", urlPattern: "https://www.hotfrog.co.uk/search/uk/{region}/{industry}", category: "directory" },
  { name: "Checkatrade", urlPattern: "https://www.checkatrade.com/search?q={industry}&location={region}", category: "trade" },
  { name: "TrustATrader", urlPattern: "https://www.trustatrader.com/traders/{industry}/{region}", category: "trade" },
  { name: "Law Society", urlPattern: "https://solicitors.lawsociety.org.uk/search/results?Type=1&location={region}", category: "register" },
  { name: "NHS GP", urlPattern: "https://www.nhs.uk/service-search/find-a-gp/results/{region}", category: "register" },
];

const EMAIL_REGEX = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;
const UK_PHONE_REGEX = /(?:\+44[\s\-.]?(?:\(0\)[\s\-.]?)?|0(?:1|2|3|7|8))[\d\s\-.()]{7,16}\d/g;
const UK_POSTCODE_REGEX = /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}\b/i;
const NAME_LABEL_REGEX = /(?:contact|manager|owner|director|proprietor|principal|dr\.?|mr\.?|mrs\.?|ms\.?|miss)\s*[:\-]?\s*([A-Z][a-z]{1,20}\s+[A-Z][a-z]{1,20})/i;
const PROPER_NAME_REGEX = /^(?:Dr\.?\s+|Mr\.?\s+|Mrs\.?\s+|Ms\.?\s+)?[A-Z][a-z]{1,20}\s+[A-Z][a-z]{1,20}$/;

const JUNK_DOMAINS = new Set([
  "example.com", "test.com", "domain.com", "email.com", "noreply.com", "no-reply.com",
  "donotreply.com", "mailinator.com", "tempmail.com", "guerrillamail.com", "sentry.io",
  "wixpress.com", "amazonaws.com", "cloudfront.net", "googletagmanager.com", "facebook.com",
  "twitter.com", "instagram.com", "linkedin.com", "tiktok.com", "youtube.com", "w3.org",
  "schema.org", "apple.com", "microsoft.com",
]);

const JUNK_PREFIXES = new Set([
  "noreply", "no-reply", "donotreply", "do-not-reply", "postmaster", "mailer-daemon",
  "bounce", "unsubscribe", "admin", "webmaster", "hostmaster", "abuse", "support", "info",
]);

function inferSeniority(title: string): string {
  const t = title.toLowerCase();
  if (/\b(ceo|cto|cfo|coo|founder|chief|president|owner|proprietor|principal)\b/.test(t)) return "C-Level";
  if (/\b(director|head of)\b/.test(t)) return "Director";
  if (/\b(manager|lead|team lead|supervisor)\b/.test(t)) return "Manager";
  if (/\b(partner|associate)\b/.test(t)) return "Senior";
  return "Individual Contributor";
}

function isValidEmail(email: string): boolean {
  if (!email || !email.includes("@") || email.length < 6) return false;
  const [local, domain] = email.toLowerCase().split("@");
  if (!local || !domain) return false;
  if (JUNK_DOMAINS.has(domain) || JUNK_PREFIXES.has(local)) return false;
  if (!domain.includes(".")) return false;
  if (/\.(png|jpg|gif|css|js|svg|ico|woff)$/.test(domain)) return false;
  return true;
}

function buildQueue(cycleIndex: number, batchSize: number): QueueItem[] {
  const queue: QueueItem[] = [];

  for (let i = 0; i < batchSize; i++) {
    const idx = cycleIndex * batchSize + i;
    const source = SOURCES[idx % SOURCES.length];
    const industry = UK_INDUSTRIES[Math.floor(idx / SOURCES.length) % UK_INDUSTRIES.length];
    const region = UK_REGIONS[Math.floor(idx / (SOURCES.length * UK_INDUSTRIES.length)) % UK_REGIONS.length];
    const url = source.urlPattern
      .replaceAll("{industry}", industry)
      .replaceAll("{region}", region);

    queue.push({ url, source: source.name, category: source.category, industry, region });
  }

  return queue;
}

async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LeadPulseBot/1.0; +https://lovable.dev)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });

    if (!response.ok) return "";
    const html = await response.text();
    return html.length > 200 ? html : "";
  } catch {
    return "";
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractEmails(html: string, rawText: string): string[] {
  const emails = new Set<string>();

  for (const match of html.matchAll(/mailto:([^"'?\s>]+)/gi)) {
    const email = decodeHtml(match[1]).toLowerCase().trim();
    if (isValidEmail(email)) emails.add(email);
  }

  for (const match of rawText.matchAll(EMAIL_REGEX)) {
    const email = match[0].toLowerCase().replace(/[.,;:'"]+$/g, "").trim();
    if (isValidEmail(email)) emails.add(email);
  }

  return [...emails];
}

function extractPhone(html: string, rawText: string): string | null {
  const telMatch = html.match(/tel:([^"'\s>]+)/i);
  if (telMatch) return decodeHtml(telMatch[1]).replace(/[^\d+\s().-]/g, "").trim();

  const phoneMatch = rawText.match(UK_PHONE_REGEX);
  return phoneMatch?.[0]?.trim() || null;
}

function extractName(html: string, rawText: string): string | null {
  const personSchema = html.match(/itemtype=["'][^"']*schema\.org\/Person[^"']*["'][\s\S]{0,1200}?itemprop=["']name["'][^>]*>([^<]+)/i);
  if (personSchema) {
    const name = decodeHtml(personSchema[1]);
    if (PROPER_NAME_REGEX.test(name)) return name;
  }

  const metaAuthor = html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)/i);
  if (metaAuthor) {
    const name = decodeHtml(metaAuthor[1]);
    if (PROPER_NAME_REGEX.test(name)) return name;
  }

  const labelMatch = rawText.match(NAME_LABEL_REGEX);
  if (labelMatch && PROPER_NAME_REGEX.test(labelMatch[1])) return labelMatch[1].trim();

  const headingMatches = [...html.matchAll(/<h[1-3][^>]*>([^<]{4,60})<\/h[1-3]>/gi)];
  for (const match of headingMatches) {
    const text = decodeHtml(stripHtml(match[1]));
    if (PROPER_NAME_REGEX.test(text)) return text;
  }

  return null;
}

function extractCompany(html: string, rawText: string): string | null {
  const orgSchema = html.match(/itemtype=["'][^"']*schema\.org\/(?:Organization|LocalBusiness)[^"']*["'][\s\S]{0,1400}?itemprop=["']name["'][^>]*>([^<]+)/i);
  if (orgSchema) return decodeHtml(orgSchema[1]);

  const ogSite = html.match(/<meta[^>]+property=["']og:(?:site_name|title)["'][^>]+content=["']([^"']+)/i);
  if (ogSite) return decodeHtml(ogSite[1]).split(/\s*[|—-]\s*/)[0].trim();

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return decodeHtml(titleMatch[1]).split(/\s*[|—-]\s*/)[0].trim();

  const h1Match = html.match(/<h1[^>]*>([^<]{3,120})<\/h1>/i);
  if (h1Match) return decodeHtml(stripHtml(h1Match[1]));

  const firstSentence = rawText.slice(0, 120).trim();
  return firstSentence || null;
}

function extractJobTitle(rawText: string): string | null {
  const match = rawText.match(/(?:title|role|position|job)[:\s]+([A-Z][a-zA-Z\s]{3,50})/i);
  return match?.[1]?.trim() || null;
}

function extractAddress(rawText: string): string | null {
  const match = rawText.match(UK_POSTCODE_REGEX);
  if (!match || match.index === undefined) return null;
  const start = Math.max(0, match.index - 80);
  const end = Math.min(rawText.length, match.index + match[0].length + 24);
  return rawText.slice(start, end).replace(/\s{2,}/g, " ").trim();
}

function extractListingLinks(html: string, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const links = new Set<string>();
  const matches = [...html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)];

  for (const match of matches) {
    const href = match[1];
    try {
      const url = new URL(href, baseUrl);
      const path = url.pathname.toLowerCase();
      if (url.hostname !== base.hostname) continue;
      if (["/search", "/find", "/login", "/register", "/signup", "/privacy", "/terms", "/about", "/help"].some((p) => path.includes(p))) continue;
      if ([".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".webp", ".pdf"].some((ext) => path.includes(ext))) continue;
      if (path.split("/").filter(Boolean).length < 2) continue;
      links.add(`${url.origin}${url.pathname}`);
      if (links.size >= 12) break;
    } catch {
      continue;
    }
  }

  return [...links];
}

function parsePage(html: string, item: QueueItem, sourceUrl: string) {
  const rawText = stripHtml(html);
  const emails = extractEmails(html, rawText);
  if (emails.length === 0) return [];

  const phone = extractPhone(html, rawText);
  const fullName = extractName(html, rawText);
  const company = extractCompany(html, rawText);
  const title = extractJobTitle(rawText);
  const address = extractAddress(rawText);
  const nameParts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "Unknown";
  const lastName = nameParts.slice(1).join(" ") || "Unknown";

  return emails.map((email) => ({
    first_name: firstName,
    last_name: lastName,
    title: title || item.industry.replace(/-/g, " "),
    company: company || "Unknown",
    email,
    phone: phone || "",
    country: "United Kingdom",
    domain: email.split("@")[1] || "",
    industry: item.industry.replace(/-/g, " "),
    company_size: "SME",
    seniority: inferSeniority(title || ""),
    verified: "likely",
    confidence: 62,
    raw_data: {
      source_name: item.source,
      source_category: item.category,
      region: item.region,
      source_url: sourceUrl,
      address,
    },
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const unauthorized = await authorizeRequest(req, "service", corsHeaders);
  if (unauthorized) return unauthorized;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const cycleIndex = body.cycle_index ?? Math.floor(Date.now() / 120000);
    const batchSize = Math.min(Math.max(body.batch_size ?? 3, 1), 6);
    const queue = buildQueue(cycleIndex, batchSize);

    let totalLeads = 0;

    const results = await Promise.all(queue.map(async (item) => {
      const pageHtml = await fetchHtml(item.url);
      if (!pageHtml) return 0;

      const listingLinks = extractListingLinks(pageHtml, item.url);
      const pages = [
        { html: pageHtml, url: item.url },
        ...(await Promise.all(listingLinks.map(async (link) => ({ html: await fetchHtml(link), url: link })))).filter((p) => p.html),
      ];

      const leads = pages.flatMap((page) => parsePage(page.html, item, page.url));
      const unique = leads.filter((lead, index, arr) => arr.findIndex((l) => l.email === lead.email) === index);

      if (unique.length > 0) {
        const { error } = await supabase.from("leads").upsert(unique, { onConflict: "email" });
        if (error) console.error(`DB error for ${item.url}:`, error.message);
      }

      return unique.length;
    }));

    totalLeads = results.reduce((sum, count) => sum + count, 0);

    const { count } = await supabase.from("leads").select("*", { count: "exact", head: true });

    return new Response(JSON.stringify({
      success: true,
      leads_found: totalLeads,
      total_in_db: count || 0,
      urls_scraped: queue.length,
      sources: [...new Set(queue.map((item) => item.source))],
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
