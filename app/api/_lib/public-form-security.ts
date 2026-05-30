export function getClientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "anonymous";
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidFormStartedAt(value: unknown, minimumMs = 2500) {
  const startedAt = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(startedAt)) return false;
  return Date.now() - startedAt >= minimumMs;
}