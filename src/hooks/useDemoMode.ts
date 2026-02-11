import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

import { isDemoSessionActive } from "../services/demoSession";
import { isDemoModeOptedIn, onDemoModeOptInChange } from "../services/demoModeOptIn";

function payloadToGroups(payload?: Record<string, unknown>): string[] {
  const raw = payload?.["cognito:groups"];
  if (!Array.isArray(raw)) return [];
  return raw.map(String);
}

function payloadToRole(payload?: Record<string, unknown>): string {
  const raw = payload?.["custom:role"];
  return typeof raw === "string" ? raw : "";
}

export function useDemoMode(signedIn: boolean): {
  isDemo: boolean;
  isDemoIdentity: boolean;
  isDemoSession: boolean;
  isDemoOptIn: boolean;
} {
  const [isDemoIdentity, setIsDemoIdentity] = useState(false);
  const [isDemoOptIn, setIsDemoOptIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!signedIn) {
      const t = window.setTimeout(() => {
        if (!cancelled) setIsDemoIdentity(false);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    void (async () => {
      try {
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload as Record<string, unknown> | undefined;

        const groups = payloadToGroups(payload);
        const role = payloadToRole(payload);

        const next = groups.includes("Demo") || role === "Demo";
        if (!cancelled) setIsDemoIdentity(next);
      } catch {
        if (!cancelled) setIsDemoIdentity(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      if (cancelled) return;
      setIsDemoOptIn(isDemoModeOptedIn());
    };

    const t = window.setTimeout(() => {
      if (!signedIn) {
        if (!cancelled) setIsDemoOptIn(false);
        return;
      }
      refresh();
    }, 0);

    const unsub = signedIn ? onDemoModeOptInChange(refresh) : () => {};
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      unsub();
    };
  }, [signedIn]);

  const isDemoSession = useMemo(() => {
    if (!signedIn) return false;
    return isDemoSessionActive();
  }, [signedIn]);

  const isDemo = isDemoIdentity || isDemoSession || isDemoOptIn;

  return { isDemo, isDemoIdentity, isDemoSession, isDemoOptIn };
}
