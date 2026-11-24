import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLoader } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetSchema, authError } from "@/lib/auth-validation";
import { toast } from "sonner";

export default function ResetPassword() {
  const { user, loading: resolving, isRecovery, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const navigate = useNavigate();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !isRecovery) { toast.error("Open a valid password reset link from your email."); return; }
    const parsed = resetSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) throw error;
      setUpdated(true);
      toast.success("Password updated. Sign in with your new password.");
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) { toast.error(authError(error)); }
    finally { setLoading(false); }
  };
  if (resolving) return <AuthLoader />;
  return <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle>Choose a new password</CardTitle></CardHeader>
      <CardContent>
        {updated ? <p role="status">Password updated. <Link to="/login" className="text-primary">Sign in</Link></p> : user && isRecovery ? <form onSubmit={submit} noValidate className="space-y-4">
          <div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} /></div>
          <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm password</Label><Input id="confirmPassword" type="password" autoComplete="new-password" maxLength={128} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button>
        </form> : <div className="space-y-4"><p className="text-sm text-muted-foreground">This reset link is missing or has expired.</p><Button asChild className="w-full"><Link to="/forgot-password">Request a new reset link</Link></Button></div>}
      </CardContent>
    </Card>
  </div>;
}
