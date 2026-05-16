import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import {
  asBooleanOrNull,
  asNullableString,
  isRecord,
  noStoreJson,
  parseObjectId,
} from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  let slug = baseSlug || "person";
  let counter = 1;

  while (true) {
    const found = await db.collection("people_profiles").findOne({ slug });
    if (!found) return slug;
    if (excludeId && String(found._id) === excludeId) return slug;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const doc = await db.collection("people_profiles").findOne({ _id: oid });

  if (!doc) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  return noStoreJson({
    ok: true,
    item: {
      id: String(doc._id),
      name: typeof doc.name === "string" ? doc.name : "",
      slug: typeof doc.slug === "string" ? doc.slug : "",
      bio: typeof doc.bio === "string" ? doc.bio : null,
      avatarUrl: typeof doc.avatarUrl === "string" ? doc.avatarUrl : null,
      isPublic: typeof doc.isPublic === "boolean" ? doc.isPublic : true,
    },
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const name = (asNullableString(body.name) ?? "").trim().slice(0, 120);
  const slugInput = (asNullableString(body.slug) ?? "").trim();
  const bio = (asNullableString(body.bio) ?? "").trim().slice(0, 4000);
  const avatarUrl = (asNullableString(body.avatarUrl) ?? "").trim().slice(0, 500);
  const isPublic = asBooleanOrNull(body.isPublic) ?? true;

  if (!name) return noStoreJson({ ok: false, error: "Name is required." }, { status: 400 });
  if (!avatarUrl) return noStoreJson({ ok: false, error: "Avatar is required." }, { status: 400 });

  const slug = await ensureUniqueSlug(slugify(slugInput || name), id);

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("people_profiles").updateOne(
    { _id: oid },
    {
      $set: {
        name,
        slug,
        bio: bio || null,
        avatarUrl,
        isPublic,
        updatedAt: new Date(),
      },
    }
  );

  if (!result.matchedCount) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  return noStoreJson({ ok: true, slug });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const result = await db.collection("people_profiles").deleteOne({ _id: oid });

  if (!result.deletedCount) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  return noStoreJson({ ok: true });
}