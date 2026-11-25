import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  domain: string;
  industry: string;
  companySize: string;
  seniority: string;
  verified: "verified" | "likely" | "unverified";
  linkedIn?: string;
  confidence: number;
}

interface SearchParams {
  query: string;
  country: string;
  industry: string;
  companySize: string;
  seniority: string;
  page?: number;
  perPage?: number;
}

interface SearchResult {
  leads: Lead[];
  total: number;
  page: number;
}

export function useLeadSearch() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const search = async (params: SearchParams) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      // Lead data stays private: searching needs a signed-in account even in preview.
      toast.error("Please sign in to search leads.", {
        action: { label: "Sign in", onClick: () => { window.location.href = "/login"; } },
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-leads", {
        body: {
          query: params.query,
          country: params.country,
          industry: params.industry,
          company_size: params.companySize,
          seniority: params.seniority,
          page: params.page || 1,
          per_page: params.perPage || 25,
        },
      });

      if (error) throw error;

      const mapped: Lead[] = (data.leads || []).map((l: any, i: number) => ({
        id: l.apollo_id || `lead-${i}`,
        firstName: l.first_name,
        lastName: l.last_name,
        title: l.title,
        company: l.company,
        email: l.email,
        phone: l.phone,
        country: l.country,
        domain: l.domain,
        industry: l.industry,
        companySize: l.company_size,
        seniority: l.seniority,
        verified: l.verified as "verified" | "likely" | "unverified",
        linkedIn: l.linkedin_url,
        confidence: l.confidence,
      }));

      setLeads(mapped);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (err: any) {
      console.error("Search failed:", err);
      toast.error("Search failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return { leads, total, page, loading, search, setPage };
}
