import { Lead } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Building2, Globe, Linkedin, Download, ListPlus, X, Shield } from "lucide-react";

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
}

const verifiedColors: Record<string, string> = {
  verified: "bg-emerald/10 text-emerald border-emerald/20",
  likely: "bg-amber/10 text-amber border-amber/20",
  unverified: "bg-destructive/10 text-destructive border-destructive/20",
};

const LeadDetail = ({ lead, onClose }: LeadDetailProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="font-display text-xl">
              {lead.firstName} {lead.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{lead.title} at {lead.company}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Contact Information
            </h4>
            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{lead.email}</span>
                </div>
                <Badge variant="outline" className={`text-xs capitalize ${verifiedColors[lead.verified]}`}>
                  {lead.verified}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {lead.phone}
              </div>
              {lead.linkedIn && (
                <a href={lead.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile
                </a>
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Company
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Industry</div>
                <div className="text-sm font-medium mt-0.5">{lead.industry}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Size</div>
                <div className="text-sm font-medium mt-0.5">{lead.companySize} employees</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Country</div>
                <div className="text-sm font-medium mt-0.5">{lead.country}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Confidence</div>
                <div className="text-sm font-medium mt-0.5">{lead.confidence}%</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 gap-2" variant="outline">
              <ListPlus className="h-4 w-4" /> Save to List
            </Button>
            <Button className="flex-1 gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadDetail;
