import { revalidatePath } from "next/cache";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { asString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { slugifyTag, isValidTagSlug } from "@/lib/server/media-tags";
import { adminBlogCategoryOf, listAdminBlogCategories } from "@/lib/server/admin-catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  return noStoreJson({ ok: true, items: await listAdminBlogCategories(await getDb()) });
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const name = asString(body.name).trim();
  if (!name) return noStoreJson({ ok: false, error: "Name is required" }, { status: 400 });

  const slug = slugifyTag(asString(body.slug).trim() || name);
  if (!slug || !isValidTagSlug(slug)) {
    return noStoreJson({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const db = await getDb();

  const exists = await db
    .collection("blog_categories")
    .findOne({ slug }, { projection: { _id: 1 } });
  if (exists) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });

  const last = await db
    .collection("blog_categories")
    .find({})
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  const nextOrder =
    last.length && typeof last[0]?.order === "number" && Number.isFinite(last[0].order)
      ? last[0].order + 1
      : 0;

  const now = new Date();
  const doc = { name, slug, isActive: true, order: nextOrder, createdAt: now, updatedAt: now };
  const r = await db.collection("blog_categories").insertOne(doc);

  revalidatePath("/blog", "layout");

  return noStoreJson({ ok: true, id: r.insertedId.toString(), item: adminBlogCategoryOf({ ...doc, _id: r.insertedId }, 0) });
}
