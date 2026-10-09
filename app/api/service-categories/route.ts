import { revalidatePath } from "next/cache";
import { revalidatePublicTree } from "@/app/api/_lib/revalidate";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import {
  asString,
  isRecord,
  noStoreJson,
  normalizeSlug,
} from "@/app/api/_lib/common";
import { adminServiceCategoryOf, listAdminServiceCatalog } from "@/lib/server/admin-catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdminOr401();
  if (guard) return guard;

  const { categories } = await listAdminServiceCatalog(await getDb());
  return noStoreJson({ ok: true, items: categories });
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
  const doc = { name, slug, isActive: true, order: nextOrder, isSystem: false, createdAt: now, updatedAt: now };
  const r = await db.collection("service_categories").insertOne(doc);

  revalidatePublicTree("/services");
  revalidatePath("/contact");

  return noStoreJson(
    { ok: true, id: r.insertedId.toString(), item: adminServiceCategoryOf({ ...doc, _id: r.insertedId }, 0) },
    { status: 201 }
  );
}