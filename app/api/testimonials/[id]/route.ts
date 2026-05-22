import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import {
  asBooleanOrNull,
  asNumberOrNull,
  asStringArray,
  isRecord,
  noStoreJson,
  parseObjectId,
} from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

function serializeTestimonial(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    name: typeof doc.name === "string" ? doc.name : "",
    email: typeof doc.email === "string" ? doc.email : null,
    about: typeof doc.about === "string" ? doc.about : null,
    location: typeof doc.location === "string" ? doc.location : null,
    review: typeof doc.review === "string" ? doc.review : "",
    rating: typeof doc.rating === "number" && doc.rating >= 1 && doc.rating <= 5 ? doc.rating : 0,
    profilePhotoUrl: typeof doc.profilePhotoUrl === "string" ? doc.profilePhotoUrl : null,
    photoUrls: asStringArray(doc.photoUrls, 12),
    isApproved: typeof doc.isApproved === "boolean" ? doc.isApproved : false,
    sortOrder: typeof doc.sortOrder === "number" ? doc.sortOrder : 100,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : null,
  };
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);

  if (!oid) {
    return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const doc = await db.collection("testimonials").findOne({ _id: oid });

  if (!doc) {
    return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });
  }

  return noStoreJson({ ok: true, item: serializeTestimonial(doc) });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);

  if (!oid) {
    return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as unknown;

  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const isApproved = asBooleanOrNull(body.isApproved);
  const sortOrder = asNumberOrNull(body.sortOrder);

  if (isApproved === null && sortOrder === null) {
    return noStoreJson(
      {
        ok: false,
        error: "Only approval status and sort order can be changed for testimonials.",
      },
      { status: 400 }
    );
  }

  const $set: Record<string, unknown> = { updatedAt: new Date() };

  if (isApproved !== null) {
    $set.isApproved = isApproved;
    $set.approvedAt = isApproved ? new Date() : null;
  }

  if (sortOrder !== null) {
    if (!Number.isFinite(sortOrder)) {
      return noStoreJson({ ok: false, error: "Invalid sort order." }, { status: 400 });
    }

    $set.sortOrder = Math.round(sortOrder);
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("testimonials").updateOne({ _id: oid }, { $set });

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

  if (!oid) {
    return noStoreJson({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const result = await db.collection("testimonials").deleteOne({ _id: oid });

  if (!result.deletedCount) {
    return noStoreJson({ ok: false, error: "Not found." }, { status: 404 });
  }

  return noStoreJson({ ok: true });
}