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
    const session = await fetchAuthSession();
    const groups = session.tokens?.idToken?.payload?.["cognito:groups"];
    const first = pickFirstString(groups);

    if (typeof groups === "string") return groups === "Admin";
    if (Array.isArray(groups)) return groups.includes("Admin");
    if (first) return first === "Admin";
    return false;
  } catch {
    return false;
  }
}
