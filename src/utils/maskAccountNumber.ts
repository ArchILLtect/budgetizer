export function maskAccountNumber(accountNumber: string): string {
  if (typeof accountNumber !== "string") return "";

  const trimmed = accountNumber.trim();
  if (!trimmed) return "";

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!digitsOnly) return accountNumber;

  // Heuristic: only mask when it looks like an account number.
  // Avoid masking labels like "Checking 1".
  const hasLetters = /[a-z]/i.test(trimmed);
  const digitDensity = digitsOnly.length / trimmed.length;
  const looksLikeAccountNumber = !hasLetters && digitsOnly.length >= 6 && digitDensity >= 0.6;
  if (!looksLikeAccountNumber) return accountNumber;

  const last4 = digitsOnly.slice(-4);
  return `xxxx-xx-${last4}`;
}
