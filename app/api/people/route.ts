import { revalidatePath } from "next/cache";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import {
  asBooleanOrNull,
  asNullableString,
  isRecord,
  noStoreJson,
} from "@/app/api/_lib/common";
import { isAllowedCloudinaryUrl } from "@/lib/server/cloudinary-assets";
import { CLOUDINARY_PEOPLE_FOLDER } from "@/lib/cloudinary-folders";

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
  const db = await getDb();

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
  if (deny) return deny;

  const db = await getDb();

  const docs = await db
    .collection("people_profiles")
    .find({})
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    name: typeof doc.name === "string" ? doc.name : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    bio: typeof doc.bio === "string" ? doc.bio : null,
    avatarUrl: typeof doc.avatarUrl === "string" ? doc.avatarUrl : null,
    isPublic: typeof doc.isPublic === "boolean" ? doc.isPublic : true,
  }));

  return noStoreJson({ ok: true, items });
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const name = (asNullableString(body.name) ?? "").trim().slice(0, 120);
  const slugInput = (asNullableString(body.slug) ?? "").trim();
  const bio = (asNullableString(body.bio) ?? "").trim().slice(0, 4000);
  const avatarUrl = (asNullableString(body.avatarUrl) ?? "").trim().slice(0, 500);
  const isPublic = asBooleanOrNull(body.isPublic) ?? true;

  if (!name) return noStoreJson({ ok: false, error: "Name is required." }, { status: 400 });
  if (!avatarUrl) return noStoreJson({ ok: false, error: "Avatar is required." }, { status: 400 });

  if (!isAllowedCloudinaryUrl(avatarUrl, [CLOUDINARY_PEOPLE_FOLDER])) {
    return noStoreJson(
      { ok: false, error: "Avatar must be uploaded to the people folder." },
      { status: 400 }
    );
  }

  const slug = await ensureUniqueSlug(slugify(slugInput || name));

  const now = new Date();
  const db = await getDb();

  const result = await db.collection("people_profiles").insertOne({
    name,
    slug,
    bio: bio || null,
    avatarUrl,
    isPublic,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/people", "layout");

  return noStoreJson({ ok: true, id: String(result.insertedId), slug });
}