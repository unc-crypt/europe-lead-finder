import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AuthLoader() {
  return <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Resolving session"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
}
export function ProtectedRoute() {
  const { user, loading, isRecovery } = useAuth();
  if (loading) return <AuthLoader />;
  if (isRecovery) return <Navigate to="/reset-password" replace />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
export function GuestRoute() {
  const { user, loading, isRecovery } = useAuth();
  if (loading) return <AuthLoader />;
  if (isRecovery) return <Navigate to="/reset-password" replace />;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
