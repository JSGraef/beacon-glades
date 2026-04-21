export const ADMIN_EMAILS: readonly string[] = [
  "teriyaki@gmail.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((allowed) => allowed.trim().toLowerCase() === normalized);
}
