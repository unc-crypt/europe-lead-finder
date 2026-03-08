import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { europeanDomains } from "@/lib/mock-data";
import {
  Search, Mail, Phone, Shield, Globe, Zap, ArrowRight, CheckCircle2, Users, Building2, TrendingUp, Star,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Verified Contacts", value: "50M+", icon: Users },
  { label: "Companies", value: "10M+", icon: Building2 },
  { label: "Countries", value: "195+", icon: Globe },
  { label: "Accuracy Rate", value: "97%", icon: TrendingUp },
];

const features = [
  { icon: Mail, title: "Email Discovery", desc: "Find verified business emails with pattern matching and domain-level intelligence across European and global markets." },
  { icon: Phone, title: "Phone Numbers", desc: "Access direct dials and mobile numbers for decision makers. Verified through multiple data sources." },
  { icon: Shield, title: "Real-Time Verification", desc: "Every contact is verified in real-time using external APIs. Know exactly which emails will bounce." },
  { icon: Globe, title: "European Focus", desc: "Deep coverage of European business domains — from gmx.de to abv.bg. Unmatched in the EU market." },
];

const pricing = [
  { name: "Starter", price: "Free", credits: "50 credits/mo", features: ["50 email lookups", "10 phone reveals", "CSV export", "Basic filters"], popular: false },
  { name: "Professional", price: "$49", credits: "1,000 credits/mo", features: ["1,000 email lookups", "200 phone reveals", "Bulk export", "Advanced filters", "Saved lists", "Priority support"], popular: true },
  { name: "Enterprise", price: "$199", credits: "10,000 credits/mo", features: ["10,000 email lookups", "2,000 phone reveals", "API access", "Team features", "CRM integrations", "Dedicated support"], popular: false },
];

const testimonials = [
  { name: "Stefan Weber", role: "Sales Director, Munich", text: "LeadPulse's European coverage is unmatched. We doubled our German market pipeline in 3 months.", stars: 5 },
  { name: "Claire Martin", role: "Growth Lead, Paris", text: "Finally a tool that understands European B2B. The email accuracy is incredible.", stars: 5 },
  { name: "Piotr Nowak", role: "CEO, Warsaw", text: "The Polish market data quality blew us away. Best investment for our outbound team.", stars: 5 },
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
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5 text-sm font-medium">
              <Globe className="h-3.5 w-3.5" /> European B2B Data Leader
            </Badge>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Find leads that{" "}
              <span className="text-gradient">convert</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Discover verified emails and phone numbers for B2B prospects across Europe and beyond.
              Built for sales teams that close deals.
            </p>

            <form onSubmit={handleSearch} className="mt-10 flex items-center gap-2 mx-auto max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by company, domain, or job title..."
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
              No credit card required · 50 free credits to start
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5 text-center">
                <s.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                <div className="font-display text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Everything you need to find leads</h2>
            <p className="mt-4 text-muted-foreground">Powerful tools to discover, verify, and export B2B contacts at scale.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
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

      {/* European Domains */}
      <section id="domains" className="py-20 bg-card border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Deep European Coverage</h2>
            <p className="mt-4 text-muted-foreground">We track contacts across all major European email domains and ISPs.</p>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {europeanDomains.map((d) =>
              d.domains.map((domain) => (
                <Badge key={domain} variant="outline" className="px-3 py-1.5 text-sm font-mono">
                  {domain}
                </Badge>
              ))
            )}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {europeanDomains.map((d) => (
              <Badge key={d.country} variant="secondary" className="text-xs">
                {d.country}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-border">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-center md:text-4xl">Trusted by European sales teams</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
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

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-card border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground">Start free. Scale as you grow.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
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
                    {p.price !== "Free" && <span className="text-muted-foreground text-sm">/mo</span>}
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
                    <Link to="/signup">{p.price === "Free" ? "Start Free" : "Get Started"}</Link>
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
            <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to find your next customers?</h2>
            <p className="mt-4 text-muted-foreground">Join thousands of European sales teams using LeadPulse to close more deals.</p>
            <Button size="lg" className="mt-8 gap-2" asChild>
              <Link to="/signup">Get Started Free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
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
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 LeadPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
