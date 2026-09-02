type HeaderGetter = { get(name: string): string | null };

export function getClientAddress(source: Request | HeaderGetter) {
  const headers: HeaderGetter = "get" in source ? source : source.headers;

  const netlifyIp = headers.get("x-nf-client-connection-ip")?.trim();
  if (netlifyIp) return netlifyIp;

  if (process.env.NODE_ENV !== "production") {
    const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const realIp = headers.get("x-real-ip")?.trim();
    return forwardedFor || realIp || "anonymous";
  }

  return "anonymous";
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidFormStartedAt(value: unknown, minimumMs = 2500) {
  const startedAt = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(startedAt)) return false;
  return Date.now() - startedAt >= minimumMs;
}