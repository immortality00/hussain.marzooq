import { noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { searchTestimonialLocations } from "@/lib/server/location-search";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const LOCATION_SEARCH_RATE_LIMIT_WINDOW_MS = 60_000;
const LOCATION_SEARCH_RATE_LIMIT_MAX = 30;

export async function GET(request: Request) {
  const clientKey = getClientAddress(request);

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "testimonial-location-search",
    key: clientKey,
    limit: LOCATION_SEARCH_RATE_LIMIT_MAX,
    windowMs: LOCATION_SEARCH_RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
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