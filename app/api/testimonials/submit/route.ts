import { getDb } from "@/lib/server/db";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import {
  resolveTestimonialLocationById,
  resolveTestimonialLocationByLabel,
} from "@/lib/server/location-search";
import {
  asNullableString,
  asNumberOrNull,
  asStringArray,
  isRecord,
  noStoreJson,
} from "@/app/api/_lib/common";
import {
  getClientAddress,
  isValidEmail,
  isValidFormStartedAt,
} from "@/app/api/_lib/public-form-security";

export const dynamic = "force-dynamic";

const TESTIMONIALS_FOLDER = "hm_visuals/testimonials";
const SUBMIT_RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const SUBMIT_RATE_LIMIT_MAX = 4;
const MINIMUM_FORM_TIME_MS = 2500;

type NormalizedResolvedLocation = {
  locationId: string | null;
  locationLabel: string | null;
  location: string | null;
  locationLat: number | null;
  locationLon: number | null;
  locationCountryCode: string | null;
};

function normalizeRating(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

function isAllowedCloudinaryTestimonialUrl(value: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return false;
    if (url.hostname !== "res.cloudinary.com") return false;

    const decodedPathname = decodeURIComponent(url.pathname);
    const uploadPrefix = `/${cloudName}/image/upload/`;

    if (!decodedPathname.startsWith(uploadPrefix)) return false;
    return decodedPathname.includes(`/${TESTIMONIALS_FOLDER}/`);
  } catch {
    return false;
  }
}

function normalizeOptionalPhotoUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 700) return null;
  return isAllowedCloudinaryTestimonialUrl(trimmed) ? trimmed : null;
}

function normalizeResolvedLocation(value: unknown): NormalizedResolvedLocation | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  return {
    locationId:
      typeof record.locationId === "string"
        ? record.locationId
        : typeof record.id === "string"
          ? record.id
          : null,
    locationLabel:
      typeof record.locationLabel === "string"
        ? record.locationLabel
        : typeof record.label === "string"
          ? record.label
          : typeof record.displayName === "string"
            ? record.displayName
            : null,
    location:
      typeof record.location === "string"
        ? record.location
        : typeof record.name === "string"
          ? record.name
          : typeof record.label === "string"
            ? record.label
            : null,
    locationLat:
      typeof record.locationLat === "number"
        ? record.locationLat
        : typeof record.lat === "number"
          ? record.lat
          : null,
    locationLon:
      typeof record.locationLon === "number"
        ? record.locationLon
        : typeof record.lon === "number"
          ? record.lon
          : typeof record.lng === "number"
            ? record.lng
            : null,
    locationCountryCode:
      typeof record.locationCountryCode === "string"
        ? record.locationCountryCode
        : typeof record.countryCode === "string"
          ? record.countryCode
          : null,
  };
}

export async function POST(req: Request) {
  const clientKey = getClientAddress(req);

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "public-testimonials-submit",
    key: clientKey,
    limit: SUBMIT_RATE_LIMIT_MAX,
    windowMs: SUBMIT_RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
    return noStoreJson(
      { ok: false, error: "Too many submissions. Try again later." },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => null)) as unknown;

  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const honeypot = (asNullableString(body.website) ?? "").trim();
  if (honeypot) return noStoreJson({ ok: true });

  if (!isValidFormStartedAt(body.formStartedAt, MINIMUM_FORM_TIME_MS)) {
    return noStoreJson(
      { ok: false, error: "Submission was too fast. Please try again." },
      { status: 400 }
    );
  }

  const name = (asNullableString(body.name) ?? "").trim().slice(0, 120);
  const email = (asNullableString(body.email) ?? "").trim().toLowerCase().slice(0, 200);
  const about = (asNullableString(body.about) ?? "").trim().slice(0, 120);
  const locationId = (asNullableString(body.locationId) ?? "").trim().slice(0, 120);
  const locationLabel = (asNullableString(body.locationLabel) ?? "").trim().slice(0, 180);
  const review = (asNullableString(body.review) ?? "").trim().slice(0, 3000);
  const rating = normalizeRating(asNumberOrNull(body.rating));
  const profilePhotoUrl = normalizeOptionalPhotoUrl(asNullableString(body.profilePhotoUrl) ?? "");
  const photoUrls = asStringArray(body.photoUrls, 12)
    .map(normalizeOptionalPhotoUrl)
    .filter((value): value is string => Boolean(value));

  if (!name) return noStoreJson({ ok: false, error: "Name is required." }, { status: 400 });
  if (!email) return noStoreJson({ ok: false, error: "Email is required." }, { status: 400 });
  if (!isValidEmail(email)) {
    return noStoreJson({ ok: false, error: "Email format is invalid." }, { status: 400 });
  }
  if (!review) return noStoreJson({ ok: false, error: "Review is required." }, { status: 400 });
  if (!rating) return noStoreJson({ ok: false, error: "Star rating is required." }, { status: 400 });

  let resolvedLocation: NormalizedResolvedLocation | null = null;

  if (locationId) {
    resolvedLocation = normalizeResolvedLocation(await resolveTestimonialLocationById(locationId));
    if (!resolvedLocation) {
      return noStoreJson({ ok: false, error: "Selected location is invalid." }, { status: 400 });
    }
  } else if (locationLabel) {
    resolvedLocation = normalizeResolvedLocation(
      await resolveTestimonialLocationByLabel(locationLabel)
    );
  }

  const db = await getDb();
  const now = new Date();

  await db.collection("testimonials").insertOne({
    name,
    email,
    about: about || null,
    location:
      resolvedLocation?.location ?? (locationLabel || null),
    locationId: resolvedLocation?.locationId ?? null,
    locationLabel: resolvedLocation?.locationLabel ?? null,
    locationLat: resolvedLocation?.locationLat ?? null,
    locationLon: resolvedLocation?.locationLon ?? null,
    locationCountryCode: resolvedLocation?.locationCountryCode ?? null,
    review,
    rating,
    profilePhotoUrl,
    photoUrls,
    isApproved: false,
    sortOrder: 100,
    createdAt: now,
    updatedAt: now,
  });

  return noStoreJson({ ok: true });
}