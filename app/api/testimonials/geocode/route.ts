import { geocodeLocation } from "@/lib/server/geocoding";
import { asNullableString, isRecord, noStoreJson } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

const GEOCODE_RATE_LIMIT_WINDOW_MS = 60_000;
const GEOCODE_RATE_LIMIT_MAX = 10;
const geocodeAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "anonymous";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const existing = geocodeAttempts.get(key);

  if (!existing || existing.resetAt <= now) {
    geocodeAttempts.set(key, { count: 1, resetAt: now + GEOCODE_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > GEOCODE_RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return noStoreJson(
      { ok: false, error: "Too many location lookups. Try again later." },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => null)) as unknown;

  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const query = (asNullableString(body.query) ?? "").trim();

  if (query.length < 2) {
    return noStoreJson({ ok: false, error: "Enter a city or country." }, { status: 400 });
  }

  const result = await geocodeLocation(query);

  if (!result) {
    return noStoreJson(
      { ok: false, error: "Location was not found. Try a city and country name." },
      { status: 404 }
    );
  }

  return noStoreJson({ ok: true, result });
}