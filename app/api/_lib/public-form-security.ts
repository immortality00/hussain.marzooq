type HeaderGetter = { get(name: string): string | null };

export function getClientAddress(source: Request | HeaderGetter) {
  const headers: HeaderGetter = "get" in source ? source : source.headers;
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
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