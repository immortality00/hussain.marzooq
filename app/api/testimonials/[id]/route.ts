import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import {
  asBooleanOrNull,
  asNullableString,
  asNumberOrNull,
  asStringArray,
  isRecord,
  noStoreJson,
  parseObjectId,
} from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

function normalizeRating(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const doc = await db.collection("testimonials").findOne({ _id: oid });

  if (!doc) return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });

  return noStoreJson({
    ok: true,
    item: {
      id: String(doc._id),
      name: typeof doc.name === "string" ? doc.name : "",
      email: typeof doc.email === "string" ? doc.email : null,
      about: typeof doc.about === "string" ? doc.about : null,
      location: typeof doc.location === "string" ? doc.location : null,
      review: typeof doc.review === "string" ? doc.review : "",
      rating:
        typeof doc.rating === "number" && doc.rating >= 1 && doc.rating <= 5
          ? doc.rating
          : 0,
      profilePhotoUrl: typeof doc.profilePhotoUrl === "string" ? doc.profilePhotoUrl : null,
      photoUrls: asStringArray(doc.photoUrls, 12),
      isApproved: typeof doc.isApproved === "boolean" ? doc.isApproved : false,
      sortOrder: typeof doc.sortOrder === "number" ? doc.sortOrder : 100,
    },
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const name = (asNullableString(body.name) ?? "").trim().slice(0, 120);
  const email = (asNullableString(body.email) ?? "").trim().slice(0, 200);
  const about = (asNullableString(body.about) ?? "").trim().slice(0, 120);
  const location = (asNullableString(body.location) ?? "").trim().slice(0, 120);
  const review = (asNullableString(body.review) ?? "").trim().slice(0, 3000);
  const rating = normalizeRating(asNumberOrNull(body.rating));
  const profilePhotoUrl = (asNullableString(body.profilePhotoUrl) ?? "").trim().slice(0, 500);
  const photoUrls = asStringArray(body.photoUrls, 12);
  const isApproved = asBooleanOrNull(body.isApproved) ?? true;
  const sortOrder = asNumberOrNull(body.sortOrder) ?? 100;

  if (!name) return noStoreJson({ ok: false, error: "Name is required." }, { status: 400 });
  if (!email) return noStoreJson({ ok: false, error: "Email is required." }, { status: 400 });
  if (!review) return noStoreJson({ ok: false, error: "Review is required." }, { status: 400 });
  if (rating === null) {
    return noStoreJson({ ok: false, error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("testimonials").updateOne(
    { _id: oid },
    {
      $set: {
        name,
        email,
        about: about || null,
        location: location || null,
        review,
        rating,
        profilePhotoUrl: profilePhotoUrl || null,
        photoUrls,
        isApproved,
        sortOrder,
        updatedAt: new Date(),
      },
    }
  );

  if (!result.matchedCount) {
    return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });
  }

  return noStoreJson({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const result = await db.collection("testimonials").deleteOne({ _id: oid });

  if (!result.deletedCount) {
    return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });
  }

  return noStoreJson({ ok: true });
}