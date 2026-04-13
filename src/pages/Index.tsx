import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Search, ArrowRight, CheckCircle2 } from "lucide-react";
import heroNetworkImg from "@/assets/hero-network.jpg";
import europeCoverageImg from "@/assets/europe-coverage.jpg";
import emailDiscoveryImg from "@/assets/email-discovery.jpg";
import salesTeamImg from "@/assets/sales-team.jpg";

// ── Data ──────────────────────────────────────────────────────────────────────

const DOMAINS: Record<string, string[]> = {
  "United Kingdom": ["btinternet.com", "sky.com", "virginmedia.com", "talktalk.net", "btopenworld.com", "ntlworld.com", "blueyonder.co.uk"],
  Germany: ["gmx.de", "web.de", "t-online.de", "freenet.de", "gmx.net"],
  France: ["orange.fr", "wanadoo.fr", "free.fr", "sfr.fr", "laposte.net"],
  Italy: ["libero.it", "virgilio.it", "tiscali.it", "alice.it", "tin.it"],
  Spain: ["terra.es", "ya.com", "telefonica.net", "movistar.es"],
  Netherlands: ["planet.nl", "kpnmail.nl", "ziggo.nl", "xs4all.nl"],
  Belgium: ["skynet.be", "telenet.be", "proximus.be"],
  Switzerland: ["bluewin.ch", "sunrise.ch", "gmx.ch"],
  Austria: ["gmx.at", "aon.at", "a1.net", "chello.at"],
  Luxembourg: ["pt.lu", "vo.lu"],
  Sweden: ["telia.com", "comhem.se", "bredbandsbolaget.se"],
  Denmark: ["tdcadsl.dk", "jubii.dk", "stofanet.dk"],
  Norway: ["online.no", "broadpark.no", "telenor.com"],
  Finland: ["kolumbus.fi", "welho.com", "elisanet.fi"],
  Iceland: ["simnet.is", "internet.is"],
  Poland: ["wp.pl", "o2.pl", "interia.pl", "onet.pl", "poczta.fm"],
  "Czech Republic": ["seznam.cz", "centrum.cz", "volny.cz", "atlas.cz"],
  Romania: ["yahoo.ro", "rdslink.ro", "clicknet.ro"],
  Hungary: ["freemail.hu", "citromail.hu", "t-online.hu"],
  Bulgaria: ["abv.bg", "mail.bg", "gbg.bg", "dir.bg"],
};

const FLAGS: Record<string, string> = {
  "United Kingdom": "🇬🇧", Germany: "🇩🇪", France: "🇫🇷", Italy: "🇮🇹", Spain: "🇪🇸",
  Netherlands: "🇳🇱", Belgium: "🇧🇪", Switzerland: "🇨🇭", Austria: "🇦🇹", Luxembourg: "🇱🇺",
  Sweden: "🇸🇪", Denmark: "🇩🇰", Norway: "🇳🇴", Finland: "🇫🇮", Iceland: "🇮🇸",
  Poland: "🇵🇱", "Czech Republic": "🇨🇿", Romania: "🇷🇴", Hungary: "🇭🇺", Bulgaria: "🇧🇬",
};

const allDomains = Object.values(DOMAINS).flat();

const emailLists = [
  { count: "31,983", title: "Construction & Trades", desc: "Builders, plumbers, electricians, roofers, plasterers across every UK region.", tags: ["builders", "plumbers", "+8 more"] },
  { count: "40,000+", title: "Healthcare & Medical", desc: "NHS GPs, dentists, opticians, care homes, pharmacies, physiotherapists with email.", tags: ["GPs", "dentists", "+6 more"] },
  { count: "28,749", title: "Professional Services", desc: "Solicitors, accountants, architects, financial advisors. Decision-makers only.", tags: ["solicitors", "accountants", "+9 more"] },
  { count: "13,123", title: "Hospitality & Food", desc: "Restaurants, hotels, pubs, cafes, catering, wedding venues across all UK cities.", tags: ["restaurants", "hotels", "+5 more"] },
  { count: "3,877", title: "Agriculture & Farming", desc: "The only verified list of UK farm contacts with emails. Arable, livestock, poultry.", tags: ["arable", "livestock"] },
  { count: "28,000", title: "Procurement & Buying", desc: "Purchasing managers, procurement directors and buying professionals at UK companies.", tags: ["procurement", "buying"] },
  { count: "200k+", title: "UK Charities & NGOs", desc: "All 200,000+ Charity Commission registered organisations. Free bulk download available.", tags: ["charities", "NGOs"] },
  { count: "Custom", title: "Build Your Own", desc: "Any industry, region, company size, or job title. Pulled from 17 UK sources live.", tags: ["any industry", "any region"] },
];

const howSteps = [
  { num: 1, title: "Search or browse", desc: "Filter by country, industry, job title, domain or region. No demo. No sales call needed.", active: true },
  { num: 2, title: "Preview results", desc: "See real records before spending a credit. Name, email, company and phone visible upfront.", active: false },
  { num: 3, title: "Verify & enrich", desc: "Every email checked via DNS MX and SMTP. Bounces filtered before you download.", active: false },
  { num: 4, title: "Export instantly", desc: "Download CSV immediately. Push to HubSpot, Pipedrive or Salesforce in one click.", active: false },
];

const pricingPlans = [
  { tier: "Starter", price: "Free", sub: "", credits: "50 credits / month", features: ["50 email lookups", "10 phone reveals", "UK leads only", "CSV export", "5 saved lists"], featured: false, cta: "Start Free" },
  { tier: "Professional", price: "$49", sub: "/mo", credits: "2,500 credits / month", features: ["2,500 email lookups", "500 phone reveals", "UK + EU leads", "Advanced filters", "Bulk export", "CRM integration", "Priority support"], featured: true, cta: "Get Started" },
  { tier: "Business", price: "$149", sub: "/mo", credits: "10,000 credits / month", features: ["10,000 lookups", "2,000 phone reveals", "All EU countries", "Full API access", "Team seats", "Custom enrichment", "SLA guarantee"], featured: false, cta: "Get Started" },
  { tier: "Enterprise", price: "Custom", sub: "", credits: "Unlimited", features: ["Unlimited lookups", "Unlimited reveals", "White-label option", "SSO & SAML", "Custom integrations", "Dedicated manager", "24/7 support"], featured: false, cta: "Contact Sales" },
];

const comparisonRows = [
  { feature: "EU contact pool", us: "680M+ target", cognism: "~millions", apollo: "~50M", ukm: "1.48M UK" },
  { feature: "Starting price", us: "Free", cognism: "$15k+/yr", apollo: "$99/mo", ukm: "£20/1k records" },
  { feature: "Self-serve (no demo)", us: "✓ Yes", cognism: "✗ Demo req.", apollo: "✓ Yes", ukm: "✗ Email req." },
  { feature: "Instant download", us: "✓ Instant", cognism: "✗ Custom quote", apollo: "✓ Instant", ukm: "✗ 24–48 hrs" },
  { feature: "200+ EU domains tracked", us: "✓ All tracked", cognism: "~30", apollo: "~20", ukm: "✗ UK only" },
  { feature: "Eastern EU coverage", us: "210M+ target", cognism: "Limited", apollo: "~5M", ukm: "✗ N/A" },
  { feature: "Live updates (every 2 min)", us: "✓ Yes", cognism: "Periodic", apollo: "Periodic", ukm: "Monthly" },
  { feature: "GDPR compliant", us: "✓ Built for EU", cognism: "✓ Yes", apollo: "△ Basic", ukm: "✓ ICO reg." },
];

const testimonials = [
  { initials: "SW", name: "Stefan Weber", role: "Sales Director — TechVentures GmbH", text: '"We were paying Cognism £18k a year for German leads. Switched to LeadPulse and got 50,000 gmx.de and web.de contacts in week one. Pipeline doubled in 3 months."', domains: "gmx.de · web.de · t-online.de · freenet.de" },
  { initials: "EC", name: "Emma Clarke", role: "Head of Growth — Clarke Solicitors LLP", text: '"Used UK Marketing Management for years — waited 48 hours for every CSV. LeadPulse is live, self-serve, costs a fraction. Downloaded 2,000 verified UK solicitor emails in 10 minutes."', domains: "btinternet.com · sky.com · virginmedia.com" },
  { initials: "PN", name: "Piotr Nowak", role: "CEO — Warsaw Solutions", text: '"The Eastern European data is unmatched. wp.pl, onet.pl, poczta.fm — Apollo doesn\'t even try. We\'re building pipeline in Poland and Czech Republic that no competitor can touch."', domains: "wp.pl · onet.pl · interia.pl · poczta.fm" },
  { initials: "LF", name: "Lucia Fernández", role: "VP Sales — Iberia Digital", text: '"3x more Spanish leads than Apollo. terra.es, movistar.es, telefonica.net — all verified and downloadable instantly. Half the price. No contract. No \'book a demo\' nonsense."', domains: "terra.es · movistar.es · telefonica.net · ya.com" },
  { initials: "HJ", name: "Henrik Johansson", role: "Revenue Lead — Nordic SaaS AB", text: '"Nobody covers the Nordics properly. telia.com, comhem.se, online.no — LeadPulse tracks them all. Prospecting in Sweden and Norway with data no one else can supply."', domains: "telia.com · comhem.se · online.no · tdcadsl.dk" },
  { initials: "DI", name: "Dimitar Ivanov", role: "Founder — Sofia Labs", text: '"abv.bg, mail.bg, dir.bg — these Bulgarian domains exist in LeadPulse and nowhere else. For any business selling into Eastern Europe this is the only platform that actually helps."', domains: "abv.bg · mail.bg · gbg.bg · dir.bg" },
];

const heroRows = [
  { email: "j.smith@btinternet.com", name: "James Smith · Smith Plumbing", domain: "btinternet.com", status: "verified" },
  { email: "emma@clarkesolicitors.co.uk", name: "Emma Clarke · Clarke LLP", domain: ".co.uk", status: "verified" },
  { email: "info@brighton-dental.co.uk", name: "Brighton Dental Practice", domain: ".co.uk", status: "verified" },
  { email: "stefan.w@gmx.de", name: "Stefan Weber · Weber GmbH", domain: "gmx.de", status: "verified" },
  { email: "claire@orange.fr", name: "Claire Martin · Innovatech", domain: "orange.fr", status: "pending" },
];

const coverageItems = [
  { flag: "🇬🇧", title: "United Kingdom — Live now", desc: "94,903 leads from Yell, Companies House, FreeIndex, Checkatrade, NHS registers, Ofsted, Law Society, Bark, TrustATrader and 8 more. Growing every 2 minutes." },
  { flag: "🇩🇪🇫🇷🇮🇹", title: "Western Europe — Building now", desc: "Germany, France, Italy, Spain, Netherlands, Belgium, Switzerland, Austria. Targeting gmx.de, orange.fr, libero.it, terra.es and 40+ country-specific domains." },
  { flag: "🇵🇱🇨🇿🇷🇴🇭🇺", title: "Eastern Europe — Queued", desc: "Poland, Czech Republic, Romania, Hungary, Bulgaria. wp.pl, seznam.cz, yahoo.ro, freemail.hu, abv.bg — domains Apollo barely tracks." },
  { flag: "🇸🇪🇳🇴🇩🇰🇫🇮", title: "Nordics — Queued", desc: "Sweden, Norway, Denmark, Finland, Iceland. telia.com, online.no, tdcadsl.dk, kolumbus.fi — a region nobody else covers properly." },
];

// ── Component ─────────────────────────────────────────────────────────────────

const Index = () => {
  const [count, setCount] = useState(94903);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 4) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const formatted = count.toLocaleString();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── TICKER ── */}
      <div className="mt-16 overflow-hidden bg-primary py-2.5 relative">
        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-primary to-transparent z-10" />
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-primary to-transparent z-10" />
        <div ref={tickerRef} className="flex w-max animate-[tick_55s_linear_infinite] hover:[animation-play-state:paused]">
          {[...allDomains, ...allDomains].map((d, i) => (
            <div key={i} className="flex items-center gap-1.5 px-4 border-r border-white/15 whitespace-nowrap font-mono text-xs text-white/75">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-white font-medium">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-16 lg:py-20 border-b border-border" style={{ background: "linear-gradient(175deg, hsl(var(--primary)/0.06) 0%, hsl(var(--background)) 55%, hsl(var(--muted)/0.3) 100%)" }}>
        <img src={heroNetworkImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04] z-0" />
        <div className="absolute inset-0 z-0" style={{
          backgroundImage: "linear-gradient(hsl(var(--primary)/0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
        }} />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500 animate-pulse" />
                LIVE — <span>{formatted}</span> verified UK leads in database
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-5">
                Find any UK &<br />European business<br />contact. <span className="text-primary">Instantly.</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-md">
                <strong className="text-foreground font-semibold">{formatted} UK leads</strong> scraped this week from Companies House, Yell, FreeIndex, Checkatrade, NHS registers and 14 other sources — verified via SMTP and growing every 2 minutes.
                <br /><br />
                Expanding to <strong className="text-foreground font-semibold">680M+ European leads</strong> across 44 countries, tracking 200+ domains including gmx.de, orange.fr, wp.pl and abv.bg.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/30" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
                  Start Free — 50 Credits <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={() => document.getElementById("lists")?.scrollIntoView({ behavior: "smooth" })}>
                  Browse Email Lists
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {["GDPR compliant", "ICO registered", "95% deliverability", "No demo required", "Instant download"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{t}</span>
                ))}
              </div>
            </div>

            {/* Right — Dashboard visual */}
            <div className="relative hidden lg:block">
              {/* Floating top badge */}
              <div className="absolute -top-5 -right-4 z-20 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-lg">📈</div>
                <div>
                  <div className="text-xl font-extrabold">+2,401</div>
                  <div className="text-[11px] text-muted-foreground font-mono">leads added today</div>
                </div>
              </div>

              {/* Main dashboard card */}
              <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-muted border-b border-border px-4 py-3 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-md px-3 py-1 font-mono text-[11px] text-muted-foreground">app.leadpulse.com/search</div>
                </div>
                <div className="p-4">
                  {/* Search */}
                  <div className="flex items-center gap-2.5 bg-muted border border-border rounded-lg px-3.5 py-2.5 mb-3">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1 text-[13px] text-muted-foreground">solicitors @ btinternet.com, builders @ sky.com...</span>
                    <span className="bg-primary text-primary-foreground text-[11px] font-mono font-semibold px-3 py-1 rounded-md">Search</span>
                  </div>
                  {/* Filters */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {["🇬🇧 UK", "Industry", "Domain", "✓ Verified", "📞 Has phone"].map((f, i) => (
                      <span key={f} className={`text-[11px] font-mono px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${i === 0 ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>{f}</span>
                    ))}
                  </div>
                  {/* Table header */}
                  <div className="grid grid-cols-[2.2fr_1.4fr_0.9fr_80px] px-2.5 py-1.5 bg-muted rounded-lg mb-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    <div>Email</div><div>Name / Company</div><div>Domain</div><div>Status</div>
                  </div>
                  {/* Table rows */}
                  {heroRows.map((r) => (
                    <div key={r.email} className="grid grid-cols-[2.2fr_1.4fr_0.9fr_80px] px-2.5 py-2.5 border-b border-border items-center hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                      <div className="text-xs font-mono font-medium text-primary truncate">{r.email}</div>
                      <div className="text-xs font-bold truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{r.domain}</div>
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${r.status === "verified" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-muted border-t border-border flex items-center justify-between">
                  <div className="font-mono text-[11px] text-muted-foreground">Showing 5 of <strong className="text-emerald-600">{formatted}</strong> results</div>
                  <button className="bg-primary text-primary-foreground text-[11px] font-mono font-semibold px-3.5 py-1.5 rounded-md">Export CSV</button>
                </div>
              </div>

              {/* Floating bottom badge */}
              <div className="absolute -bottom-4 -left-4 z-20 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 animate-bounce-slow" style={{ animationDelay: "1s" }}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🌍</div>
                <div>
                  <div className="text-xl font-extrabold">44</div>
                  <div className="text-[11px] text-muted-foreground font-mono">countries covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="bg-muted border-b border-border">
        <div className="container flex flex-wrap">
          {[
            { value: formatted, label: "UK leads live now", color: "text-emerald-600" },
            { value: "680M+", label: "EU target pool", color: "text-primary" },
            { value: "200+", label: "EU domains tracked", color: "" },
            { value: "44", label: "countries covered", color: "" },
            { value: "95%", label: "deliverability rate", color: "" },
            { value: "17", label: "UK scrape sources", color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="flex-1 min-w-[50%] sm:min-w-0 py-7 px-5 border-r border-border last:border-r-0 text-center">
              <div className={`text-3xl font-extrabold tracking-tight ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COVERAGE + DOMAINS ── */}
      <section id="coverage" className="py-20">
        <div className="container">
          <div className="mb-12">
            <div className="flex items-center gap-2 text-[11px] text-primary font-mono uppercase tracking-widest mb-3">
              <span className="w-5 h-0.5 bg-primary rounded" /> Coverage
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">UK-first. Then all of Europe.</h2>
            <p className="text-base text-muted-foreground max-w-lg">We started with the UK because sources are most structured. Europe expands country by country from here.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-14 items-start">
            {/* Coverage items */}
            <div className="flex flex-col gap-3">
              {coverageItems.map((c) => (
                <div key={c.title} className="bg-card border border-border rounded-2xl p-5 flex gap-3.5 items-start hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-lg shrink-0 mt-0.5">{c.flag}</div>
                  <div>
                    <div className="font-bold text-sm mb-1">{c.title}</div>
                    <div className="text-[13px] text-muted-foreground leading-relaxed">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Domain panel */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
              <div className="bg-muted border-b border-border px-5 py-3.5 flex items-center justify-between">
                <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">200+ European domains tracked</div>
                <span className="bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300">200+ domains</span>
              </div>
              <div className="p-4 max-h-[460px] overflow-y-auto">
                {Object.entries(DOMAINS).map(([country, domains]) => (
                  <div key={country} className="mb-4">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{FLAGS[country]} {country}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {domains.map((d) => (
                        <span key={d} className={`font-mono text-[11px] px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${country === "United Kingdom" ? "bg-primary/10 border-primary/25 text-primary" : "bg-muted border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10"}`}>{d}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-muted border-t border-border text-center font-mono text-xs text-muted-foreground">
                Showing 80 of <strong className="text-emerald-600">200+</strong> tracked domains — full list on signup
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EMAIL LISTS ── */}
      <section id="lists" className="bg-muted py-20 border-y border-border">
        <div className="container">
          <div className="text-center max-w-lg mx-auto mb-12">
            <div className="flex items-center gap-2 text-[11px] text-primary font-mono uppercase tracking-widest mb-3 justify-center">
              <span className="w-5 h-0.5 bg-primary rounded" /> Email lists
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Every UK industry. Every region.</h2>
            <p className="text-base text-muted-foreground">Pre-built lists ready to download, or filter and build your own list in seconds.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border rounded-2xl overflow-hidden">
            {emailLists.map((l) => (
              <div key={l.title} className="bg-card p-6 hover:bg-muted/50 transition-colors cursor-pointer relative group overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-emerald-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                <div className="text-2xl font-extrabold text-primary mb-1.5 tracking-tight">{l.count}</div>
                <div className="text-[15px] font-bold mb-2">{l.title}</div>
                <div className="text-[13px] text-muted-foreground leading-relaxed">{l.desc}</div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {l.tags.map((t) => (
                    <span key={t} className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/15 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20">
        <div className="container">
          <div className="text-center max-w-md mx-auto mb-12">
            <div className="flex items-center gap-2 text-[11px] text-primary font-mono uppercase tracking-widest mb-3 justify-center">
              <span className="w-5 h-0.5 bg-primary rounded" /> How it works
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold">From search to CSV in under 60 seconds</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-[26px] left-[12.5%] right-[12.5%] h-px" style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(var(--border)) 0, hsl(var(--border)) 8px, transparent 8px, transparent 16px)" }} />
            {howSteps.map((s) => (
              <div key={s.num} className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-extrabold relative z-10 border-2 ${s.active ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/35" : "bg-card border-border text-muted-foreground"}`}>{s.num}</div>
                <div className="font-bold text-[15px] mb-2">{s.title}</div>
                <div className="text-[13px] text-muted-foreground leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-muted py-20 border-t border-border">
        <div className="container">
          <div className="text-center max-w-lg mx-auto mb-12">
            <div className="flex items-center gap-2 text-[11px] text-primary font-mono uppercase tracking-widest mb-3 justify-center">
              <span className="w-5 h-0.5 bg-primary rounded" /> Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">No demos. No £15,000 platform fees.</h2>
            <p className="text-base text-muted-foreground">Cognism charges £15,000 before adding a single user. Our Pro plan is $49/month. No contract. Instant access.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricingPlans.map((p) => (
              <div key={p.tier} className={`bg-card border-2 rounded-2xl p-7 relative transition-all hover:-translate-y-1 hover:shadow-xl ${p.featured ? "border-primary shadow-lg shadow-primary/15" : "border-border hover:border-muted-foreground/30"}`}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-mono text-[10px] font-bold px-3.5 py-1 rounded-full tracking-wider">MOST POPULAR</div>
                )}
                <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest mb-3.5">{p.tier}</div>
                <div className="text-4xl font-extrabold tracking-tight leading-none mb-1">{p.price}<span className="text-base font-medium text-muted-foreground">{p.sub}</span></div>
                <div className="font-mono text-xs text-muted-foreground mb-5">{p.credits}</div>
                <ul className="mb-5 space-y-0">
                  {p.features.map((f) => (
                    <li key={f} className="text-[13px] text-muted-foreground py-1.5 border-b border-border last:border-b-0 flex items-center gap-2">
                      <span className="text-primary text-xs">→</span>{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={p.featured ? "default" : "outline"} asChild>
                  <Link to="/signup">{p.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section id="compare" className="py-20">
        <div className="container">
          <div className="text-center max-w-lg mx-auto mb-12">
            <div className="flex items-center gap-2 text-[11px] text-primary font-mono uppercase tracking-widest mb-3 justify-center">
              <span className="w-5 h-0.5 bg-primary rounded" /> vs competitors
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold">Cheaper than a Cognism demo.<br />More EU data than Apollo.</h2>
          </div>
          <div className="border border-border rounded-2xl overflow-hidden shadow-md max-w-4xl mx-auto">
            <div className="grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr] bg-muted border-b-2 border-border px-6 py-3.5 gap-2">
              <div className="text-sm font-bold">Feature</div>
              <div className="text-sm font-bold text-primary text-center">LeadPulse</div>
              <div className="text-sm font-bold text-muted-foreground text-center">Cognism</div>
              <div className="text-sm font-bold text-muted-foreground text-center">Apollo.io</div>
              <div className="text-sm font-bold text-muted-foreground text-center hidden md:block">UK Mktg Mgmt</div>
            </div>
            {comparisonRows.map((r, i) => (
              <div key={r.feature} className={`grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr] px-6 py-3.5 border-b border-border last:border-b-0 items-center gap-2 ${i % 2 === 1 ? "bg-muted/50" : "bg-card"}`}>
                <div className="text-sm font-medium">{r.feature}</div>
                <div className="text-sm text-center text-primary font-bold">{r.us}</div>
                <div className="text-sm text-center text-muted-foreground">{r.cognism}</div>
                <div className="text-sm text-center text-muted-foreground">{r.apollo}</div>
                <div className="text-sm text-center text-muted-foreground hidden md:block">{r.ukm}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-muted py-20 border-t border-border">
        <div className="container">
          <div className="text-center max-w-md mx-auto mb-12">
            <div className="flex items-center gap-2 text-[11px] text-primary font-mono uppercase tracking-widest mb-3 justify-center">
              <span className="w-5 h-0.5 bg-primary rounded" /> What people say
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold">Sales teams that switched from Cognism</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-sm font-extrabold text-white shrink-0">{t.initials}</div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{t.role}</div>
                  </div>
                </div>
                <div className="text-primary text-sm tracking-widest mb-3">★★★★★</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{t.text}</div>
                <div className="mt-3.5 pt-3.5 border-t border-border font-mono text-[11px] text-emerald-600 font-semibold">{t.domains}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-8">
          <div className="bg-primary rounded-3xl px-8 py-16 md:px-12 md:py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4 relative">Your scraper is running.<br />Start searching your leads.</h2>
            <p className="text-base text-primary-foreground/75 mb-10 relative">{formatted} verified UK leads right now. Growing every 2 minutes.<br />No demo. No contract. No £15,000 platform fee.</p>
            <div className="flex gap-3.5 justify-center flex-wrap relative">
              <Button size="lg" variant="secondary" className="gap-2 shadow-lg font-bold" asChild>
                <Link to="/signup">Start Free — 50 Credits <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/40 text-primary-foreground hover:border-primary-foreground hover:bg-primary-foreground/10" onClick={() => document.getElementById("lists")?.scrollIntoView({ behavior: "smooth" })}>
                Browse UK Email Lists
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-foreground py-12 pb-8">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-8 h-8 rounded-lg bg-white/12 border border-white/20 flex items-center justify-center text-white font-mono text-sm font-bold">LP</div>
                <span className="text-white text-lg font-extrabold tracking-tight">LeadPulse</span>
              </div>
              <p className="text-[13px] text-white/45 leading-relaxed max-w-[240px]">UK and European B2B lead intelligence. Verified emails, direct dials and decision-maker data across 44 countries. ICO registered. GDPR compliant.</p>
            </div>
            {[
              { title: "Product", links: ["UK Email Lists", "EU Coverage", "Live Dashboard", "API Access", "CRM Integrations"] },
              { title: "Company", links: ["About", "GDPR Policy", "Privacy", "Terms of Use", "Contact"] },
              { title: "Resources", links: ["API Docs", "Domain Index", "Data Sources", "Blog", "Status"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="font-mono text-[11px] text-white/35 uppercase tracking-widest mb-3.5">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-wrap items-center justify-between gap-3.5">
            <div className="text-xs text-white/30 font-mono">© 2026 LeadPulse Ltd. All rights reserved.</div>
            <div className="flex gap-2">
              {["ICO Registered", "GDPR Compliant", "95% Deliverability"].map((b) => (
                <span key={b} className="bg-white/6 border border-white/10 rounded-md px-2.5 py-1 text-[11px] font-mono text-white/40">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
