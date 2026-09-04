import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth() {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (loading) return <div className="auth-loading">Loading ProofMe…</div>;
  if (!configured) return <Navigate to="/auth?mode=setup" replace state={{ from: location.pathname }} />;
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
