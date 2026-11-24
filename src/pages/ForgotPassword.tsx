import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { emailSchema, authError } from "@/lib/auth-validation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: window.location.origin + "/reset-password" });
      if (error) throw error;
      setSent(true);
      toast.success("If an account exists, a password reset link has been sent.");
    } catch (error) { toast.error(authError(error)); }
    finally { setLoading(false); }
  };
  return <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle>Reset your password</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" maxLength={255} required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} /></div>
          {sent && <p role="status" className="text-sm text-muted-foreground">If an account exists, check your email for a password reset link.</p>}
          <Button className="w-full" type="submit" disabled={loading || sent}>{loading ? "Sending…" : "Send reset link"}</Button>
          <p className="text-center text-sm"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
        </form>
      </CardContent>
    </Card>
  </div>;
}
