import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import LeadTable from "@/components/LeadTable";
import LeadDetail from "@/components/LeadDetail";
import { countries, industries, companySizes, seniorityLevels } from "@/lib/mock-data";
import { useLeadSearch, Lead } from "@/hooks/useLeadSearch";
import { Search, Download, Loader2 } from "lucide-react";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [country, setCountry] = useState("All Countries");
  const [industry, setIndustry] = useState("All Industries");
  const [companySize, setCompanySize] = useState("All Sizes");
  const [seniority, setSeniority] = useState("All Levels");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { leads, total, page, loading, search } = useLeadSearch();

  const handleSearch = useCallback(() => {
    search({
      query,
      country,
      industry,
      companySize,
      seniority,
      page: 1,
    });
  }, [query, country, industry, companySize, seniority, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageChange = (newPage: number) => {
    search({
      query,
      country,
      industry,
      companySize,
      seniority,
      page: newPage,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Search Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total > 0 ? `${total.toLocaleString()} contacts found` : "Search across 1B+ verified European contacts"}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export All
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Try: lawyers @ libero.it, CTO @ gmx.de, engineers @ abv.bg..."
                className="h-11 pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="h-11 px-6 gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
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

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Scraping leads from the web...</span>
          </div>
        ) : leads.length > 0 ? (
          <>
            <LeadTable leads={leads} onViewLead={setSelectedLead} />
            {/* Pagination */}
            {total > 25 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * 25 + 1}-{Math.min(page * 25, total)} of {total.toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page * 25 >= total} onClick={() => handlePageChange(page + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Search for leads</p>
            <p className="text-sm mt-1">Try "lawyers @ libero.it" or "CTO Germany" to find contacts</p>
          </div>
        )}

        {selectedLead && <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />}
      </div>
    </div>
  );
};

export default Dashboard;
