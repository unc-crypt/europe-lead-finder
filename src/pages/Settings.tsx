import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-12 max-w-2xl">
        <h1 className="font-display text-2xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="john@company.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input defaultValue="Acme Inc." />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Notifications</CardTitle>
              <CardDescription>Configure email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Weekly digest</div>
                  <div className="text-xs text-muted-foreground">Get a summary of new leads in your saved lists</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Credit alerts</div>
                  <div className="text-xs text-muted-foreground">Notify when credits are running low</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Product updates</div>
                  <div className="text-xs text-muted-foreground">New features and improvements</div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">API Access</CardTitle>
              <CardDescription>Manage your API keys for programmatic access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input value="lp_sk_••••••••••••••••••••" readOnly className="font-mono text-sm" />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Your API key grants access to your account. Keep it secure.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
