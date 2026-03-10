import { useState } from "react";
import { Lead } from "@/hooks/useLeadSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, ExternalLink, Eye, Download, ListPlus } from "lucide-react";

interface LeadTableProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
}

const verifiedColors: Record<string, string> = {
  verified: "bg-emerald/10 text-emerald border-emerald/20",
  likely: "bg-amber/10 text-amber border-amber/20",
  unverified: "bg-destructive/10 text-destructive border-destructive/20",
};

const LeadTable = ({ leads, onViewLead }: LeadTableProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map((l) => l.id)));
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
            <Download className="h-3 w-3" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
            <ListPlus className="h-3 w-3" /> Save to List
          </Button>
        </div>
      )}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10">
                <Checkbox checked={selected.size === leads.length && leads.length > 0} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/30" onClick={() => onViewLead(lead)}>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.has(lead.id)} onCheckedChange={() => toggle(lead.id)} />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{lead.firstName} {lead.lastName}</div>
                    <div className="text-xs text-muted-foreground">{lead.title}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{lead.company}</div>
                  <div className="text-xs text-muted-foreground">{lead.industry} · {lead.companySize}</div>
                </TableCell>
                <TableCell className="text-sm">{lead.country}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm font-mono">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[180px]">{lead.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {lead.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs capitalize ${verifiedColors[lead.verified]}`}>
                    {lead.verified}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onViewLead(lead); }}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadTable;
