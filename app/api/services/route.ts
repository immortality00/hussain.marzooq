import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { isAdminAuthedServer, requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import {
  asNullableString,
  asNumberOrNull,
  isRecord,
  noStoreJson,
  normalizeSlug,
} from "@/app/api/_lib/common";
import { isAllowedCloudinaryUrl } from "@/lib/server/cloudinary-assets";
import { CLOUDINARY_SERVICES_FOLDER } from "@/lib/cloudinary-folders";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wantsAll = url.searchParams.get("all") === "1";

  const admin = await isAdminAuthedServer();
  const all = wantsAll && admin;

  const db = await getDb();

  const filter: Record<string, unknown> = {};
  if (!all) {
    filter.isActive = true;
    filter.isArchived = { $ne: true };
  }

  const docs = await db
    .collection("services")
    .find(filter)
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const items = docs.map((d) => ({
    id: typeof d._id?.toString === "function" ? d._id.toString() : String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    category: typeof d.category === "string" ? d.category : "others",
    categoryId: typeof d.categoryId === "string" ? d.categoryId : null,
    description: typeof d.description === "string" ? d.description : "",
    startingPrice: asNumberOrNull(d.startingPrice),
    currency: typeof d.currency === "string" ? d.currency : "AED",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    isArchived: typeof d.isArchived === "boolean" ? d.isArchived : false,
    imageUrl: typeof d.imageUrl === "string" ? d.imageUrl : "",
    order: typeof d.order === "number" && Number.isFinite(d.order) ? d.order : 0,
    inquiriesCount:
      typeof d.inquiriesCount === "number" && Number.isFinite(d.inquiriesCount)
        ? d.inquiriesCount
        : 0,
  }));

  return noStoreJson({ ok: true, items });
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) {
    return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const name = asNullableString(bodyUnknown.name)?.trim() ?? "";
  const slug = normalizeSlug(asNullableString(bodyUnknown.slug) ?? "");
  const description = (asNullableString(bodyUnknown.description) ?? "").trim();
  const currency = (asNullableString(bodyUnknown.currency) ?? "AED").trim() || "AED";
  const imageUrl = (asNullableString(bodyUnknown.imageUrl) ?? "").trim();
  const startingPrice = asNumberOrNull(bodyUnknown.startingPrice);
  const requestedCategoryId = (asNullableString(bodyUnknown.categoryId) ?? "").trim();

  if (!name) return noStoreJson({ ok: false, error: "Name is required" }, { status: 400 });
  if (!slug || slug.includes(" ")) {
    return noStoreJson({ ok: false, error: "Slug is required" }, { status: 400 });
  }

  if (imageUrl && !isAllowedCloudinaryUrl(imageUrl, [CLOUDINARY_SERVICES_FOLDER])) {
    return noStoreJson(
      { ok: false, error: "Service image must be uploaded to the services folder." },
      { status: 400 }
    );
  }

  const db = await getDb();

  const existing = await db.collection("services").findOne({ slug }, { projection: { _id: 1 } });
  if (existing) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });

  let categoryId: string | null = null;
  let categorySlug = "others";

  if (requestedCategoryId) {
    if (!ObjectId.isValid(requestedCategoryId)) {
      return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
    }

    const foundCategory = await db.collection("service_categories").findOne(
      { _id: new ObjectId(requestedCategoryId) },
      { projection: { _id: 1, slug: 1, isActive: 1 } }
    );

    if (!foundCategory) {
      return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
    }

    if (foundCategory.isActive === false) {
      return noStoreJson({ ok: false, error: "CATEGORY_INACTIVE" }, { status: 409 });
    }

    categoryId = String(foundCategory._id);
    categorySlug =
      typeof foundCategory.slug === "string" ? normalizeSlug(foundCategory.slug) : "others";
  } else {
    const others = await db.collection("service_categories").findOne(
      { slug: "others" },
      { projection: { _id: 1, slug: 1 } }
    );

    categoryId = others ? String(others._id) : null;
    categorySlug = typeof others?.slug === "string" ? normalizeSlug(others.slug) : "others";
  }

  const last = await db.collection("services").find({}).sort({ order: -1 }).limit(1).toArray();
  const nextOrder =
    last.length && typeof last[0]?.order === "number" && Number.isFinite(last[0].order)
      ? last[0].order + 1
      : 0;

  const now = new Date();

  const r = await db.collection("services").insertOne({
    name,
    slug,
    category: categorySlug,
    categoryId,
    description,
    startingPrice,
    currency,
    imageUrl,
    isActive: true,
    isArchived: false,
    order: nextOrder,
    inquiriesCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/services", "layout");
  revalidatePath("/");

  return noStoreJson({ ok: true, id: r.insertedId.toString() });
}