import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { signupSchema, authError } from "@/lib/auth-validation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = signupSchema.safeParse({ email, password, first_name: firstName, last_name: lastName, company });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      const { email, password, ...metadata } = parsed.data;
      const { data, error } = await supabase.auth.signUp({ email, password, options: {
        emailRedirectTo: window.location.origin + "/dashboard", data: metadata,
      } });
      if (error) throw error;
      if (!data.session) { setConfirmationSent(true); toast.success("Check your email to confirm your account before signing in."); }
    } catch (error) { toast.error(authError(error)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 font-display text-xl font-bold mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            LeadPulse
          </Link>
          <CardTitle className="font-display text-2xl">Create your account</CardTitle>
          <CardDescription>Start finding leads with 50 free credits</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={100} autoComplete="given-name" required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={100} autoComplete="family-name" required disabled={loading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" placeholder="Acme Inc." value={company} onChange={(e) => setCompany(e.target.value)} maxLength={255} autoComplete="organization" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={128} required disabled={loading} />
          </div>
          {confirmationSent && <p role="status" className="text-sm text-primary">Check your email to confirm your account before signing in.</p>}
          <Button className="w-full" type="submit" disabled={loading || confirmationSent}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
                  </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
