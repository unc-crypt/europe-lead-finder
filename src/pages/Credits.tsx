import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Search, Eye, Download, TrendingUp } from "lucide-react";

const usage = [
  { action: "Email lookup: k.mueller@techventures.de", credits: -1, time: "2 min ago" },
  { action: "Bulk export: German Tech Companies (45 leads)", credits: -45, time: "2 hours ago" },
  { action: "Phone reveal: Marie Dubois", credits: -5, time: "1 day ago" },
  { action: "Search: French SaaS companies", credits: 0, time: "1 day ago" },
  { action: "Monthly credit renewal", credits: 1000, time: "5 days ago" },
];

const Credits = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-12 max-w-3xl">
        <h1 className="font-display text-2xl font-bold mb-8">Credits & Usage</h1>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Available Credits</div>
                  <div className="font-display text-3xl font-bold">250</div>
                </div>
              </div>
              <Progress value={25} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">250 of 1,000 credits remaining this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                  <div className="font-display text-3xl font-bold">750</div>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Search className="h-3 w-3" /> 320 searches</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> 180 reveals</span>
                <span className="flex items-center gap-1"><Download className="h-3 w-3" /> 250 exports</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usage.map((u, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm">{u.action}</div>
                    <div className="text-xs text-muted-foreground">{u.time}</div>
                  </div>
                  <Badge variant={u.credits > 0 ? "default" : u.credits === 0 ? "secondary" : "outline"} className="text-xs font-mono">
                    {u.credits > 0 ? "+" : ""}{u.credits}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button size="lg" className="gap-2">
            <Zap className="h-4 w-4" /> Upgrade Plan
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Need more credits? Upgrade to Professional or Enterprise.</p>
        </div>
      </div>
    </div>
  );
};

export default Credits;
