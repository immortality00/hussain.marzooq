import { noStoreJson } from "@/app/api/_lib/common";
import { searchTestimonialLocations } from "@/lib/server/location-search";

export const dynamic = "force-dynamic";

const LOCATION_SEARCH_RATE_LIMIT_WINDOW_MS = 60_000;
const LOCATION_SEARCH_RATE_LIMIT_MAX = 30;

const searchAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();

  return forwardedFor || realIp || "anonymous";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const existing = searchAttempts.get(key);

  if (!existing || existing.resetAt <= now) {
    searchAttempts.set(key, {
      count: 1,
      resetAt: now + LOCATION_SEARCH_RATE_LIMIT_WINDOW_MS,
    });

    return false;
  }

  existing.count += 1;

  return existing.count > LOCATION_SEARCH_RATE_LIMIT_MAX;
}

export async function GET(request: Request) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return noStoreJson(
      { ok: false, error: "Too many location searches. Try again later." },
      { status: 429 }
    );
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return noStoreJson({ ok: true, items: [] });
  }

  const items = await searchTestimonialLocations(query, 8);

  return noStoreJson({ ok: true, items });
}