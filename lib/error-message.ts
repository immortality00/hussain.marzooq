export function errorMessage(e: unknown, fallback = "Action failed."): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "string" && e) return e;
  return fallback;
}
