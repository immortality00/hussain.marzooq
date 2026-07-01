import { revalidatePath } from "next/cache";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import {
  asString,
  isRecord,
  noStoreJson,
  normalizeSlug,
} from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();

  const [categories, services] = await Promise.all([
    db.collection("service_categories").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db.collection("services").find({}).project({ categoryId: 1 }).toArray(),
  ]);

  const items = categories.map((cat) => {
    const id = String(cat._id);
    const slug = typeof cat.slug === "string" ? normalizeSlug(cat.slug) : "";

    const servicesCount = services.filter((svc) => {
      const svcCategoryId = typeof svc.categoryId === "string" ? svc.categoryId : "";
      return svcCategoryId === id;
    }).length;

    return {
      id,
      name: typeof cat.name === "string" ? cat.name : "",
      slug,
      isActive: typeof cat.isActive === "boolean" ? cat.isActive : true,
      order: typeof cat.order === "number" ? cat.order : 0,
      servicesCount,
      isSystem: typeof cat.isSystem === "boolean" ? cat.isSystem : slug === "others",
    };
  });

  return noStoreJson({ ok: true, items });
}

export async function POST(req: Request) {
  const guard = await requireAdminOr401();
  if (guard) return guard;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const name = asString(body.name).trim();
  const slug = normalizeSlug(asString(body.slug));

  if (!name) return noStoreJson({ ok: false, error: "Name is required" }, { status: 400 });
  if (!slug || slug.includes(" ")) {
    return noStoreJson({ ok: false, error: "Invalid slug" }, { status: 400 });
  }
  if (slug === "others") {
    return noStoreJson({ ok: false, error: "Slug reserved" }, { status: 409 });
  }

  const db = await getDb();

  const exists = await db
    .collection("service_categories")
    .findOne({ slug }, { projection: { _id: 1 } });

  if (exists) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });

  const last = await db
    .collection("service_categories")
    .find({})
    .sort({ order: -1 })
    .limit(1)
    .toArray();

  const nextOrder =
    last.length && typeof last[0]?.order === "number" && Number.isFinite(last[0].order)
      ? last[0].order + 1
      : 0;

  const now = new Date();
  const r = await db.collection("service_categories").insertOne({
    name,
    slug,
    isActive: true,
    order: nextOrder,
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/services", "layout");

  return noStoreJson({ ok: true, id: r.insertedId.toString() }, { status: 201 });
}