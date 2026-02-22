import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { isCurrentUserAdmin } from "../services/authIdentity";
import { useUserUI } from "../hooks/useUserUI";
import { sanitizeRedirectPath } from "./redirectUtils";

function shouldBypassAuthForE2E(): boolean {
  const raw = import.meta.env.VITE_E2E_BYPASS_AUTH;
  return raw === "1" || raw === "true";
}

export function RequireAdmin({ signedIn, loading }: { signedIn: boolean; loading: boolean }) {
  const location = useLocation();
  const { userUI, loading: userUiLoading } = useUserUI();
  const [checking, setChecking] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const isAdminFromUI = useMemo(() => userUI?.role === "Admin", [userUI?.role]);

  useEffect(() => {
    let cancelled = false;

    if (!signedIn || loading) {
      setChecking(false);
      setIsAdmin(false);
      return;
    }

    // If UI already resolved admin, short-circuit without a network/token check.
    // This keeps the guard consistent with the header badge.
    if (isAdminFromUI) {
      setChecking(false);
      setIsAdmin(true);
      return;
    }

    setChecking(true);
    void isCurrentUserAdmin()
      .then((ok) => {
        if (cancelled) return;
        setIsAdmin(ok);
      })
      .finally(() => {
        if (cancelled) return;
        setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdminFromUI, loading, signedIn]);

  if (shouldBypassAuthForE2E()) return <Outlet />;

  if (loading || userUiLoading || checking) return <BasicSpinner />;
  if (!signedIn) {
    const next = sanitizeRedirectPath(`${location.pathname}${location.search}`, "/planner");
    const to = `/login?redirect=${encodeURIComponent(next)}`;
    return <Navigate to={to} replace />;
  }

  if (isAdminFromUI || isAdmin) return <Outlet />;
  return <Navigate to="/" replace />;
}
