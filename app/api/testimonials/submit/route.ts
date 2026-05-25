import clientPromise from "@/lib/mongodb";
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

export const dynamic = "force-dynamic";

const TESTIMONIALS_FOLDER = "hm_visuals/testimonials";
const SUBMIT_RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const SUBMIT_RATE_LIMIT_MAX = 4;
const MINIMUM_FORM_TIME_MS = 2500;

const submitAttempts = new Map<string, { count: number; resetAt: number }>();

function normalizeRating(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "anonymous";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const existing = submitAttempts.get(key);

  if (!existing || existing.resetAt <= now) {
    submitAttempts.set(key, { count: 1, resetAt: now + SUBMIT_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > SUBMIT_RATE_LIMIT_MAX;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidFormStartedAt(value: unknown) {
  const startedAt = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(startedAt)) return false;
  return Date.now() - startedAt >= MINIMUM_FORM_TIME_MS;
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

export async function POST(req: Request) {
  const clientKey = getClientKey(req);

  if (isRateLimited(clientKey)) {
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

  if (!isValidFormStartedAt(body.formStartedAt)) {
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
    .filter((url): url is string => Boolean(url));

  if (!name) return noStoreJson({ ok: false, error: "Name is required." }, { status: 400 });
  if (!email) return noStoreJson({ ok: false, error: "Email is required." }, { status: 400 });

  if (!isValidEmail(email)) {
    return noStoreJson({ ok: false, error: "Use a valid email address." }, { status: 400 });
  }

  if (!review) return noStoreJson({ ok: false, error: "Review is required." }, { status: 400 });
  if (rating === null) return noStoreJson({ ok: false, error: "Stars are required." }, { status: 400 });

  const verifiedLocation =
    locationId.length > 0
      ? await resolveTestimonialLocationById(locationId)
      : locationLabel.length > 0
        ? await resolveTestimonialLocationByLabel(locationLabel)
        : null;

  const now = new Date();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || "hm_visuals");

  const result = await db.collection("testimonials").insertOne({
    name,
    email,
    about: about || null,
    location: verifiedLocation?.label ?? null,
    locationId: verifiedLocation?.id ?? null,
    locationLabel: verifiedLocation?.label ?? null,
    locationLat: verifiedLocation?.lat ?? null,
    locationLon: verifiedLocation?.lon ?? null,
    locationCountryCode: verifiedLocation?.countryCode ?? null,
    review,
    rating,
    profilePhotoUrl,
    photoUrls,
    isApproved: false,
    sortOrder: 100,
    source: "public-form",
    createdAt: now,
    updatedAt: now,
  });

  return noStoreJson({ ok: true, id: String(result.insertedId) });
}