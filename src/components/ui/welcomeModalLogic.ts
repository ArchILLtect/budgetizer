import type { WelcomeModalOpenReason } from "../../services/welcomeModalPreference";

export const WELCOME_MODAL_VERSION = 1 as const;

export function shouldShowWelcomeModal(args: {
  signedIn: boolean;
  authLoading?: boolean;
  disabledByPreference: boolean;
  openRequested: boolean;
  openReason: WelcomeModalOpenReason;
}): boolean {
  const { signedIn, authLoading, disabledByPreference, openRequested, openReason } = args;

  if (!signedIn) return false;
  if (authLoading) return false;

  // Never show again applies to auto-opens (login/reminder), but manual opens should still work.
  if (disabledByPreference && openReason !== "manual") return false;

  return openRequested;
}
