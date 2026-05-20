import clientPromise from "@/lib/mongodb";
import {
  asNullableString,
  asNumberOrNull,
  asStringArray,
  isRecord,
  noStoreJson,
} from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

function normalizeRating(value: number | null) {
  if (value === null) return null;
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const name = (asNullableString(body.name) ?? "").trim().slice(0, 120);
  const about = (asNullableString(body.about) ?? "").trim().slice(0, 120);
  const review = (asNullableString(body.review) ?? "").trim().slice(0, 3000);
  const photoUrls = asStringArray(body.photoUrls, 12);
  const rating = normalizeRating(asNumberOrNull(body.rating));

  if (!name) {
    return noStoreJson({ ok: false, error: "Name is required." }, { status: 400 });
  }

  if (!review) {
    return noStoreJson({ ok: false, error: "Review is required." }, { status: 400 });
  }

  if (rating === null) {
    return noStoreJson({ ok: false, error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const now = new Date();
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("testimonials").insertOne({
    name,
    about: about || null,
    review,
    rating,
    photoUrls,
    featured: false,
    isApproved: false,
    sortOrder: 100,
    source: "public-form",
    createdAt: now,
    updatedAt: now,
  });

  return noStoreJson({ ok: true, id: String(result.insertedId) });
}