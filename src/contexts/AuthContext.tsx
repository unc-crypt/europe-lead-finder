import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isRecovery: boolean;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthState | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery");
  useEffect(() => {
    let active = true;
    let revision = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      revision += 1;
      if (!active) return;
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
      if (event === "SIGNED_OUT") setIsRecovery(false);
      // INITIAL_SESSION is validated by getUser below before routes are released.
      if (event !== "INITIAL_SESSION") setLoading(false);
    });
    const restore = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        const currentRevision = revision;
        if (error) throw error;
        if (data.session) {
          const { data: verified, error: verificationError } = await supabase.auth.getUser();
          if (active && revision === currentRevision) {
            setSession(!verificationError && verified.user ? data.session : null);
          }
        } else if (active && revision === currentRevision) setSession(null);
      } catch {
        if (active) setSession(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    void restore();
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setIsRecovery(false);
  };
  return <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, isRecovery, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
