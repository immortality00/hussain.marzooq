// lib/adminAuth.ts
export function isAdminCookieValue(v: string | undefined): boolean {
  return v === "ok";
}