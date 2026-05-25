const fixedWindowBuckets = new Map<string, { count: number; resetAt: number }>();
const duplicateSubmissionBuckets = new Map<string, number>();

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

export function consumeFixedWindowRateLimit({
  bucket,
  key,
  limit,
  windowMs,
}: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const mapKey = `${bucket}:${key}`;
  const existing = fixedWindowBuckets.get(mapKey);

  if (!existing || existing.resetAt <= now) {
    fixedWindowBuckets.set(mapKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return false;
  }

  existing.count += 1;
  return existing.count > limit;
}

export function isDuplicateSubmission({
  bucket,
  key,
  windowMs,
}: {
  bucket: string;
  key: string;
  windowMs: number;
}) {
  const now = Date.now();
  const mapKey = `${bucket}:${key}`;
  const expiresAt = duplicateSubmissionBuckets.get(mapKey);

  if (expiresAt && expiresAt > now) {
    return true;
  }

  duplicateSubmissionBuckets.set(mapKey, now + windowMs);
  return false;
}