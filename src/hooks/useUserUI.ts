import { useCallback, useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { getUserUIResult } from "../services/authService";
import type { UserUI } from "../types";

export function useUserUI(): {
  userUI: UserUI | null;
  loading: boolean;
  error: string | null;
} {
  const [userUI, setUserUI] = useState<UserUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { userUI: nextUserUI, error: nextError } = await getUserUIResult();

    setUserUI(nextUserUI);

    if (nextError) {
      const message =
        typeof nextError === "object" && nextError !== null && "message" in nextError
          ? String((nextError as { message: unknown }).message)
          : "Failed to load user attributes.";
      setError(message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);

    // Keep persistent UI (TopBar/BottomBar) in sync across sign-in/out.
    const cancelHub = Hub.listen("auth", ({ payload }) => {
      const evt = String((payload as { event?: unknown } | undefined)?.event ?? "");

      if (evt === "signIn" || evt === "signedIn") {
        void load();
      }

      if (evt === "signOut" || evt === "signedOut") {
        // Immediately clear display info. Caches are cleared elsewhere.
        setUserUI(null);
        setError(null);
        setLoading(false);
      }
    });

    return () => {
      window.clearTimeout(t);
      cancelHub();
    };
  }, [load]);

  return {
    userUI,
    loading,
    error,
  };
}
