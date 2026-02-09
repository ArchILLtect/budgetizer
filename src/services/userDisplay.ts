export function isDemoIdentityUsername(username: string): boolean {
  // Demo identity format: demo+<uuid>@...
  return /^demo\+.+@/i.test(username);
}

export function formatUsernameForDisplay(username?: string | null): string {
  if (!username) return "(unknown)";
  if (isDemoIdentityUsername(username)) return "Demo User";
  return username;
}
