import { describe, expect, it } from "vitest";

import { shouldShowWelcomeModal } from "../welcomeModalLogic";

describe("shouldShowWelcomeModal", () => {
  it("returns false when signed out", () => {
    expect(
      shouldShowWelcomeModal({
        signedIn: false,
        authLoading: false,
        disabledByPreference: false,
        openRequested: true,
        openReason: "manual",
      })
    ).toBe(false);
  });

  it("returns false while auth is loading", () => {
    expect(
      shouldShowWelcomeModal({
        signedIn: true,
        authLoading: true,
        disabledByPreference: false,
        openRequested: true,
        openReason: "manual",
      })
    ).toBe(false);
  });

  it("blocks reminder/login opens when disabled", () => {
    for (const openReason of ["login", "reminder"] as const) {
      expect(
        shouldShowWelcomeModal({
          signedIn: true,
          authLoading: false,
          disabledByPreference: true,
          openRequested: true,
          openReason,
        })
      ).toBe(false);
    }
  });

  it("allows manual open even when disabled", () => {
    expect(
      shouldShowWelcomeModal({
        signedIn: true,
        authLoading: false,
        disabledByPreference: true,
        openRequested: true,
        openReason: "manual",
      })
    ).toBe(true);
  });

  it("returns false when nothing was requested", () => {
    expect(
      shouldShowWelcomeModal({
        signedIn: true,
        authLoading: false,
        disabledByPreference: false,
        openRequested: false,
        openReason: "login",
      })
    ).toBe(false);
  });
});
