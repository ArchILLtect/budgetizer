import { fetchAuthSession, fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";

function pickFirstString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

export async function getCurrentUserSub(): Promise<string> {
  // Prefer ID token payload, fall back to current user.
  try {
    const session = await fetchAuthSession();
    const sub = session.tokens?.idToken?.payload?.sub;
    if (typeof sub === "string" && sub) return sub;
  } catch {
    // ignore
  }

  const current = await getCurrentUser();
  return current.userId;
}

export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const attrs = await fetchUserAttributes();
    return typeof attrs.email === "string" && attrs.email ? attrs.email : null;
  } catch {
    return null;
  }
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    // Prefer explicit role attribute when present.
    try {
      const attrs = await fetchUserAttributes();
      const roleFromCustom = attrs["custom:role"];
      if (typeof roleFromCustom === "string" && roleFromCustom === "Admin") return true;
    } catch {
      // ignore
    }

    const session = await fetchAuthSession();

    const idGroups = session.tokens?.idToken?.payload?.["cognito:groups"];
    const accessGroups = session.tokens?.accessToken?.payload?.["cognito:groups"];

    const matches = (groups: unknown): boolean => {
      const first = pickFirstString(groups);
      if (typeof groups === "string") return groups === "Admin";
      if (Array.isArray(groups)) return groups.includes("Admin");
      if (first) return first === "Admin";
      return false;
    };

    if (matches(accessGroups)) return true;
    if (matches(idGroups)) return true;
    return false;
  } catch {
    return false;
  }
}
