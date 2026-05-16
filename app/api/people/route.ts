import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { asBooleanOrNull, asNullableString, asStringArray, isRecord, noStoreJson } from "@/app/api/_lib/common";

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

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db.collection("people_profiles").find({}).sort({ updatedAt: -1, createdAt: -1 }).toArray();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    name: typeof doc.name === "string" ? doc.name : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    headline: typeof doc.headline === "string" ? doc.headline : null,
    bio: typeof doc.bio === "string" ? doc.bio : null,
    aliases: Array.isArray(doc.aliases) ? doc.aliases.filter((x): x is string => typeof x === "string") : [],
    avatarUrl: typeof doc.avatarUrl === "string" ? doc.avatarUrl : null,
    coverUrl: typeof doc.coverUrl === "string" ? doc.coverUrl : null,
    isPublic: typeof doc.isPublic === "boolean" ? doc.isPublic : true,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  }));

  return noStoreJson({ ok: true, items });
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const name = (asNullableString(body.name) ?? "").trim().slice(0, 120);
  const slugInput = (asNullableString(body.slug) ?? "").trim();
  const headline = (asNullableString(body.headline) ?? "").trim().slice(0, 180);
  const bio = (asNullableString(body.bio) ?? "").trim().slice(0, 4000);
  const aliases = asStringArray(body.aliases, 30);
  const avatarUrl = (asNullableString(body.avatarUrl) ?? "").trim().slice(0, 500);
  const coverUrl = (asNullableString(body.coverUrl) ?? "").trim().slice(0, 500);
  const isPublic = asBooleanOrNull(body.isPublic) ?? true;

  if (!name) {
    return noStoreJson({ ok: false, error: "Name is required." }, { status: 400 });
  }

  const baseSlug = slugify(slugInput || name);
  if (!baseSlug) {
    return noStoreJson({ ok: false, error: "Valid slug is required." }, { status: 400 });
  }

  const slug = await ensureUniqueSlug(baseSlug);

  const now = new Date();
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("people_profiles").insertOne({
    name,
    slug,
    headline: headline || null,
    bio: bio || null,
    aliases,
    avatarUrl: avatarUrl || null,
    coverUrl: coverUrl || null,
    isPublic,
    createdAt: now,
    updatedAt: now,
  });

  return noStoreJson({ ok: true, id: String(result.insertedId), slug });
}