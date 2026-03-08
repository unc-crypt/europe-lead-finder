import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import LeadTable from "@/components/LeadTable";
import LeadDetail from "@/components/LeadDetail";
import { mockLeads, countries, industries, companySizes, seniorityLevels, Lead } from "@/lib/mock-data";
import { Search, SlidersHorizontal, Download } from "lucide-react";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [country, setCountry] = useState("All Countries");
  const [industry, setIndustry] = useState("All Industries");
  const [companySize, setCompanySize] = useState("All Sizes");
  const [seniority, setSeniority] = useState("All Levels");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    return mockLeads.filter((l) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || l.firstName.toLowerCase().includes(q) || l.lastName.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.title.toLowerCase().includes(q) || l.domain.toLowerCase().includes(q);
      const matchesCountry = country === "All Countries" || l.country === country;
      const matchesIndustry = industry === "All Industries" || l.industry === industry;
      const matchesSize = companySize === "All Sizes" || l.companySize === companySize;
      const matchesSeniority = seniority === "All Levels" || l.seniority === seniority;
      return matchesQuery && matchesCountry && matchesIndustry && matchesSize && matchesSeniority;
    });
  }, [query, country, industry, companySize, seniority]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Search Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} contacts found</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export All
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, domain, job title..."
              className="h-11 pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>{countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>{industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={companySize} onValueChange={setCompanySize}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>{companySizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={seniority} onValueChange={setSeniority}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>{seniorityLevels.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <LeadTable leads={filtered} onViewLead={setSelectedLead} />

        {selectedLead && <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />}
      </div>
    </div>
  );
};

export default Dashboard;
