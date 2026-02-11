import { useEffect, useMemo, useState } from "react";
import { useUserUI } from "../hooks/useUserUI";
import { fetchMyUserProfileUI, fetchUserProfileUIById } from "../services/userProfileLookup";
import type { UserProfileUI } from "../types";

export function useProfilePageData(opts?: { userId?: string | null; enabled?: boolean }): {
  userUI: ReturnType<typeof useUserUI>["userUI"];
  loading: ReturnType<typeof useUserUI>["loading"];
  error: ReturnType<typeof useUserUI>["error"];
  userProfile: UserProfileUI | null;
  userProfileLoading: boolean;
  userProfileError: string | null;
} {
  const userUIRes = useUserUI();
  const enabled = opts?.enabled ?? true;

  const [userProfile, setUserProfile] = useState<UserProfileUI | null>(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [userProfileError, setUserProfileError] = useState<string | null>(null);

  const userId = useMemo(() => {
    const raw = opts?.userId;
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  }, [opts?.userId]);

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      setUserProfile(null);
      setUserProfileLoading(false);
      setUserProfileError(null);
      return;
    }

    setUserProfileLoading(true);
    setUserProfileError(null);

    void (async () => {
      try {
        const profile = userId ? await fetchUserProfileUIById(userId) : await fetchMyUserProfileUI();
        if (!cancelled) setUserProfile(profile);
      } catch (err) {
        const msg =
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to load profile.";
        if (!cancelled) {
          setUserProfile(null);
          setUserProfileError(msg);
        }
      } finally {
        if (!cancelled) setUserProfileLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);

  return {
    userUI: userUIRes.userUI,
    loading: userUIRes.loading,
    error: userUIRes.error,
    userProfile,
    userProfileLoading,
    userProfileError,
  };
}