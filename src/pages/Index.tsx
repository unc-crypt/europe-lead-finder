import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { europeanDomains, europeanCountries } from "@/lib/mock-data";
import {
  Search, Mail, Phone, Shield, Globe, Zap, ArrowRight, CheckCircle2, Users, Building2, TrendingUp, Star,
  Database, Target, Lock, BarChart3, Layers, Filter, MapPin,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Verified Contacts", value: "1B+", icon: Users },
  { label: "European Leads", value: "680M+", icon: MapPin },
  { label: "Companies", value: "150M+", icon: Building2 },
  { label: "European Countries", value: "44", icon: Globe },
  { label: "Email Accuracy", value: "97.5%", icon: TrendingUp },
  { label: "Domains Tracked", value: "200+", icon: Database },
];

const features = [
  { icon: Mail, title: "Email Discovery", desc: "Find verified business emails across 200+ European domains — from gmx.de to abv.bg, libero.it to wp.pl. Pattern matching and domain-level intelligence at scale." },
  { icon: Phone, title: "Direct Dials & Mobiles", desc: "Access direct phone numbers and mobile contacts for decision makers across all 44 European countries. Verified through multiple data sources." },
  { icon: Shield, title: "Real-Time Verification", desc: "Every contact verified in real-time. Email deliverability checks, bounce prediction, and confidence scoring so you never waste an outreach." },
  { icon: Globe, title: "Pan-European Coverage", desc: "The deepest European B2B database ever built. 680M+ contacts across every country from Iceland to Turkey, Portugal to Estonia." },
  { icon: Filter, title: "Advanced Filters", desc: "Filter by country, industry, company size, seniority, domain, and more. Find exactly the leads you need in seconds." },
  { icon: Target, title: "Intent & Enrichment", desc: "Enriched company data, technographics, and buying signals. Know who's ready to buy before you reach out." },
  { icon: Layers, title: "Bulk Operations", desc: "Export thousands of leads at once. Build targeted lists, enrich your CRM, and power your outbound at scale." },
  { icon: BarChart3, title: "Analytics & Insights", desc: "Track your prospecting performance. See open rates, reply rates, and conversion metrics across regions." },
];

const pricing = [
  { name: "Starter", price: "Free", credits: "50 credits/mo", features: ["50 email lookups", "10 phone reveals", "Basic filters", "CSV export", "5 saved lists"], popular: false },
  { name: "Professional", price: "$49", credits: "2,500 credits/mo", features: ["2,500 email lookups", "500 phone reveals", "Advanced filters", "Bulk export", "Unlimited lists", "CRM integration", "Priority support"], popular: true },
  { name: "Business", price: "$149", credits: "10,000 credits/mo", features: ["10,000 email lookups", "2,000 phone reveals", "API access", "Team collaboration", "Custom enrichment", "Dedicated manager", "SLA guarantee"], popular: false },
  { name: "Enterprise", price: "Custom", credits: "Unlimited", features: ["Unlimited lookups", "Unlimited reveals", "Full API access", "SSO & SAML", "Custom integrations", "White-label options", "24/7 support"], popular: false },
];

const testimonials = [
  { name: "Stefan Weber", role: "Sales Director, TechVentures GmbH — Munich", text: "LeadPulse's European coverage is unmatched. We found 50,000+ verified German contacts in our first week. Pipeline doubled in 3 months.", stars: 5 },
  { name: "Claire Martin", role: "Head of Growth, Innovatech SAS — Paris", text: "Finally a tool that truly understands European B2B. The French and DACH market data quality is incredible. Apollo doesn't come close for EU.", stars: 5 },
  { name: "Piotr Nowak", role: "CEO, Warsaw Solutions — Warsaw", text: "The Eastern European data blew us away. Polish, Czech, Romanian leads — all verified. Best investment for our outbound team.", stars: 5 },
  { name: "Lucia Fernández", role: "VP Sales, Iberia Digital — Madrid", text: "We switched from Apollo to LeadPulse for European prospecting. 3x more Spanish leads, better accuracy, and half the price.", stars: 5 },
  { name: "Henrik Johansson", role: "Revenue Lead, Nordic SaaS AB — Stockholm", text: "Incredible Nordic coverage. Swedish, Danish, Norwegian contacts that no other platform has. A game-changer for Scandinavian sales.", stars: 5 },
  { name: "Dimitar Ivanov", role: "Founder, Sofia Labs — Sofia", text: "As a Bulgarian startup, finding local B2B contacts was impossible until LeadPulse. abv.bg, mail.bg — they cover it all.", stars: 5 },
];

const europeanCoverageStats = [
  { region: "Western Europe", leads: "280M+", countries: "Germany, France, UK, Italy, Spain, Netherlands, Belgium, Switzerland, Austria" },
  { region: "Northern Europe", leads: "85M+", countries: "Sweden, Denmark, Norway, Finland, Iceland, Lithuania, Latvia, Estonia" },
  { region: "Eastern Europe", leads: "210M+", countries: "Poland, Czech Republic, Romania, Hungary, Bulgaria, Slovakia, Croatia, Serbia, Ukraine, Russia" },
  { region: "Southern Europe", leads: "105M+", countries: "Portugal, Greece, Turkey, Cyprus, Malta, Slovenia, Montenegro" },
];

const Index = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/dashboard?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5 text-sm font-medium">
              <Globe className="h-3.5 w-3.5" /> #1 European B2B Lead Database — 1 Billion+ Verified Contacts
            </Badge>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Access <span className="text-gradient">1 billion</span>{" "}
              European leads
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              The world's largest European B2B contact database. Verified emails and phone numbers across every domain in 44 countries. 
              Built for sales teams that dominate the European market.
            </p>

            <form onSubmit={handleSearch} className="mt-10 flex items-center gap-2 mx-auto max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="lawyers @ libero.it, CTO @ gmx.de, engineers @ abv.bg..."
                  className="h-12 pl-10 text-base"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 gap-2">
                Search <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · 50 free credits to start · Search 200+ European domains
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
          >
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5 text-center">
                <s.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                <div className="font-display text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* European Coverage Map */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">
              <MapPin className="h-3 w-3 mr-1" /> Pan-European Coverage
            </Badge>
            <h2 className="font-display text-3xl font-bold md:text-4xl">680M+ contacts across every European country</h2>
            <p className="mt-4 text-muted-foreground">
              The deepest European B2B database ever built. Every domain, every country, every industry.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {europeanCoverageStats.map((region) => (
              <Card key={region.region} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="font-display text-2xl font-bold text-primary">{region.leads}</div>
                  <div className="font-medium mt-1">{region.region}</div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{region.countries}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Domain badges */}
          <div className="mt-10">
            <p className="text-center text-sm font-medium text-muted-foreground mb-4">Tracking 200+ European email domains including:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {europeanDomains.slice(0, 20).map((d) =>
                d.domains.map((domain) => (
                  <Badge key={domain} variant="outline" className="px-2.5 py-1 text-xs font-mono">
                    {domain}
                  </Badge>
                ))
              )}
              <Badge variant="secondary" className="px-2.5 py-1 text-xs">+150 more</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Everything Apollo has — built for Europe</h2>
            <p className="mt-4 text-muted-foreground">Enterprise-grade prospecting tools with unmatched European data coverage.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Trusted by 10,000+ European sales teams</h2>
            <p className="mt-4 text-muted-foreground">From Berlin to Bucharest, sales teams rely on LeadPulse to fill their pipeline.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber text-amber" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Why LeadPulse over Apollo.io?</h2>
            <p className="mt-4 text-muted-foreground">Apollo is great for the US. LeadPulse is built for Europe.</p>
          </div>
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 p-4 font-medium text-sm">
                <div>Feature</div>
                <div className="text-center">LeadPulse</div>
                <div className="text-center text-muted-foreground">Apollo.io</div>
              </div>
              {[
                { feature: "European Contacts", us: "680M+", them: "~50M" },
                { feature: "European Domains", us: "200+", them: "~20" },
                { feature: "Country Coverage (EU)", us: "44 countries", them: "15 countries" },
                { feature: "Local Domain Intelligence", us: "✓ Deep", them: "✗ Limited" },
                { feature: "Eastern EU Coverage", us: "210M+ contacts", them: "~5M" },
                { feature: "GDPR Compliant", us: "✓ Built for EU", them: "✓ Basic" },
                { feature: "Price (Pro plan)", us: "$49/mo", them: "$99/mo" },
              ].map((row, i) => (
                <div key={row.feature} className={`grid grid-cols-3 p-4 text-sm ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                  <div className="font-medium">{row.feature}</div>
                  <div className="text-center text-primary font-semibold">{row.us}</div>
                  <div className="text-center text-muted-foreground">{row.them}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-card border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground">Start free. Scale as you grow. Half the price of Apollo for 10x the European data.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {pricing.map((p) => (
              <Card key={p.name} className={`relative ${p.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/50"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 pt-8">
                  <h3 className="font-display font-semibold text-lg">{p.name}</h3>
                  <div className="mt-2">
                    <span className="font-display text-4xl font-bold">{p.price}</span>
                    {p.price !== "Free" && p.price !== "Custom" && <span className="text-muted-foreground text-sm">/mo</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{p.credits}</p>
                  <ul className="mt-6 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={p.popular ? "default" : "outline"} asChild>
                    <Link to="/signup">{p.price === "Free" ? "Start Free" : p.price === "Custom" ? "Contact Sales" : "Get Started"}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to dominate European sales?</h2>
            <p className="mt-4 text-muted-foreground">
              Join 10,000+ sales teams using LeadPulse to find, verify, and close European prospects.
              Access 1 billion contacts across 44 countries.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">Start Free — 50 Credits <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/dashboard">Try a Search <Search className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 font-display font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              LeadPulse
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">GDPR</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="hover:text-foreground transition-colors">API Docs</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 LeadPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
