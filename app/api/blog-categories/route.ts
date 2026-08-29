import { revalidatePath } from "next/cache";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { asString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { slugifyTag, isValidTagSlug } from "@/lib/server/media-tags";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();

  const [categories, counts] = await Promise.all([
    db.collection("blog_categories").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db
      .collection("blog_posts")
      .aggregate<{ _id: string; count: number }>([
        { $match: { categoryId: { $type: "string", $ne: "" } } },
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const countMap = new Map<string, number>();
  for (const row of counts) countMap.set(row._id, row.count);

  const items = categories.map((cat) => {
    const id = String(cat._id);
    return {
      id,
      name: typeof cat.name === "string" ? cat.name : "",
      slug: typeof cat.slug === "string" ? cat.slug : "",
      isActive: typeof cat.isActive === "boolean" ? cat.isActive : true,
      order: typeof cat.order === "number" ? cat.order : 0,
      postsCount: countMap.get(id) ?? 0,
    };
  });

  return noStoreJson({ ok: true, items });
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
  const r = await db.collection("blog_categories").insertOne({
    name,
    slug,
    isActive: true,
    order: nextOrder,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/blog", "layout");

  return noStoreJson({ ok: true, id: r.insertedId.toString() });
}
