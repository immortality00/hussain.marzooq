import { geocodeLocation } from "@/lib/server/geocoding";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { asNullableString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";

export const dynamic = "force-dynamic";

const GEOCODE_RATE_LIMIT_WINDOW_MS = 60_000;
const GEOCODE_RATE_LIMIT_MAX = 10;

export async function POST(request: Request) {
  const clientKey = getClientAddress(request);

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "testimonial-geocode",
    key: clientKey,
    limit: GEOCODE_RATE_LIMIT_MAX,
    windowMs: GEOCODE_RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
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