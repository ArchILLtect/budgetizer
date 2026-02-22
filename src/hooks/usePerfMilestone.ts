import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRouteLoadingStore } from "../store/routeLoadingStore";
import { recordMilestone } from "../services/perfLogger";

export function usePerfMilestone(name: string): void {
  const location = useLocation();
  const startedAtMs = useRouteLoadingStore((s) => s.startedAtMs);

  useEffect(() => {
    const route = `${location.pathname}${location.search}${location.hash}`;
    const now = Date.now();
    const sinceRouteStartMs = startedAtMs ? now - startedAtMs : undefined;

    recordMilestone({ name, route, sinceRouteStartMs });
  }, [location.hash, location.pathname, location.search, name, startedAtMs]);
}
