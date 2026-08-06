import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/server/db";
import {
  findByIdOr404,
  requireAdminObjectId,
  wantsHardDelete,
} from "@/app/api/_lib/admin-route";
import {
  asFiniteNumber,
  asNumberOrNull,
  asString,
  isRecord,
  noStoreJson,
  normalizeSlug,
} from "@/app/api/_lib/common";
import {
  deleteManagedCloudinaryAsset,
  isAllowedCloudinaryUrl,
} from "@/lib/server/cloudinary-assets";
import { CLOUDINARY_SERVICES_FOLDER } from "@/lib/cloudinary-folders";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const db = await getDb();

  const found = await findByIdOr404(db, "services", oid);
  if (found instanceof Response) return found;
  const existing = found.doc;

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.slug === "string") patch.slug = normalizeSlug(body.slug);
  if (typeof body.description === "string") patch.description = body.description.trim();
  if (typeof body.currency === "string") patch.currency = body.currency.trim() || "AED";

  if (typeof body.imageUrl === "string") {
    const nextImageUrl = body.imageUrl.trim();
    if (nextImageUrl && !isAllowedCloudinaryUrl(nextImageUrl, [CLOUDINARY_SERVICES_FOLDER])) {
      return noStoreJson(
        { ok: false, error: "Service image must be uploaded to the services folder." },
        { status: 400 }
      );
    }
    patch.imageUrl = nextImageUrl;
  }

  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (typeof body.isArchived === "boolean") patch.isArchived = body.isArchived;

  const sp = body.startingPrice === null ? null : asNumberOrNull(body.startingPrice);
  if (body.startingPrice === null) patch.startingPrice = null;
  else if (sp !== null) patch.startingPrice = sp;

  const order = asFiniteNumber(body.order);
  if (order !== null) patch.order = order;

  if ("categoryId" in body) {
    const requestedCategoryId = asString(body.categoryId).trim();

    if (!requestedCategoryId) {
      const others = await db.collection("service_categories").findOne(
        { slug: "others" },
        { projection: { _id: 1, slug: 1 } }
      );

      patch.category = typeof others?.slug === "string" ? normalizeSlug(others.slug) : "others";
      patch.categoryId = others ? String(others._id) : null;
    } else {
      if (!ObjectId.isValid(requestedCategoryId)) {
        return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
      }

      const cat = await db.collection("service_categories").findOne(
        { _id: new ObjectId(requestedCategoryId) },
        { projection: { _id: 1, slug: 1, isActive: 1 } }
      );

      if (!cat) {
        return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
      }

      patch.category = typeof cat.slug === "string" ? normalizeSlug(cat.slug) : "others";
      patch.categoryId = String(cat._id);

      if (cat.isActive === false) {
        patch.isActive = false;
      }
    }
  } else if (typeof body.category === "string") {
    const requestedCategory = normalizeSlug(body.category || "others") || "others";

    if (requestedCategory === "others") {
      const others = await db.collection("service_categories").findOne(
        { slug: "others" },
        { projection: { _id: 1, slug: 1 } }
      );

      patch.category = typeof others?.slug === "string" ? normalizeSlug(others.slug) : "others";
      patch.categoryId = others ? String(others._id) : null;
    } else {
      const cat = await db.collection("service_categories").findOne(
        { slug: requestedCategory },
        { projection: { _id: 1, slug: 1, isActive: 1 } }
      );

      if (!cat) {
        return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
      }

      patch.category = typeof cat.slug === "string" ? normalizeSlug(cat.slug) : requestedCategory;
      patch.categoryId = String(cat._id);

      if (cat.isActive === false) {
        patch.isActive = false;
      }
    }
  }

  const existingArchived = existing.isArchived === true;
  const wantsActive = patch.isActive === true;
  const willBeArchived =
    typeof patch.isArchived === "boolean" ? patch.isArchived === true : existingArchived;

  if (wantsActive && willBeArchived) {
    return noStoreJson({ ok: false, error: "SERVICE_ARCHIVED" }, { status: 409 });
  }

  if (wantsActive) {
    const nextCategoryId =
      typeof patch.categoryId === "string"
        ? patch.categoryId
        : typeof existing.categoryId === "string"
          ? existing.categoryId
          : null;

    const nextCategorySlug =
      typeof patch.category === "string"
        ? patch.category
        : typeof existing.category === "string"
          ? existing.category
          : "others";

    if (normalizeSlug(nextCategorySlug) !== "others") {
      if (!nextCategoryId || !ObjectId.isValid(nextCategoryId)) {
        return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
      }

      const cat = await db.collection("service_categories").findOne(
        { _id: new ObjectId(nextCategoryId) },
        { projection: { _id: 1, slug: 1, isActive: 1 } }
      );

      if (!cat) {
        return noStoreJson({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
      }

      if (cat.isActive === false) {
        return noStoreJson({ ok: false, error: "CATEGORY_INACTIVE" }, { status: 409 });
      }

      patch.category = typeof cat.slug === "string" ? normalizeSlug(cat.slug) : nextCategorySlug;
      patch.categoryId = String(cat._id);
    }
  }

  if ("slug" in patch) {
    const slug = asString(patch.slug).trim();
    if (!slug || slug.includes(" ")) {
      return noStoreJson({ ok: false, error: "Invalid slug" }, { status: 400 });
    }

    const conflict = await db.collection("services").findOne({
      slug,
      _id: { $ne: oid },
    });
    if (conflict) {
      return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });
    }
  }

  const previousImageUrl = typeof existing.imageUrl === "string" ? existing.imageUrl : "";
  const nextImageUrl =
    typeof patch.imageUrl === "string" ? patch.imageUrl : previousImageUrl;

  await db.collection("services").updateOne({ _id: oid }, { $set: patch });

  if (previousImageUrl && previousImageUrl !== nextImageUrl) {
    await deleteManagedCloudinaryAsset(
      { url: previousImageUrl },
      [CLOUDINARY_SERVICES_FOLDER]
    );
  }

  const oldSlug = typeof existing.slug === "string" ? existing.slug : null;
  const newSlug = typeof patch.slug === "string" ? patch.slug : oldSlug;

  revalidatePath("/services", "layout");
  revalidatePath("/");
  if (oldSlug) revalidatePath(`/services/${oldSlug}`);
  if (newSlug && newSlug !== oldSlug) revalidatePath(`/services/${newSlug}`);

  return noStoreJson({ ok: true });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { id, oid } = gate;

  const hard = wantsHardDelete(req);

  const db = await getDb();

  const found = await findByIdOr404(db, "services", oid);
  if (found instanceof Response) return found;
  const service = found.doc;

  const serviceSlug = typeof service.slug === "string" ? service.slug : null;

  if (!hard) {
    await db.collection("services").updateOne(
      { _id: oid },
      { $set: { isArchived: true, isActive: false, updatedAt: new Date() } }
    );

    revalidatePath("/services", "layout");
    revalidatePath("/");
    if (serviceSlug) revalidatePath(`/services/${serviceSlug}`);

    return noStoreJson({ ok: true, mode: "archived" });
  }

  const inquiriesCount = await db.collection("inquiries").countDocuments({ serviceId: id });
  if (inquiriesCount > 0) {
    return noStoreJson(
      { ok: false, error: "SERVICE_HAS_INQUIRIES", inquiriesCount },
      { status: 409 }
    );
  }

  const imageUrl = typeof service.imageUrl === "string" ? service.imageUrl : "";

  await db.collection("services").deleteOne({ _id: oid });

  if (imageUrl) {
    await deleteManagedCloudinaryAsset(
      { url: imageUrl },
      [CLOUDINARY_SERVICES_FOLDER]
    );
  }

  revalidatePath("/services", "layout");
  revalidatePath("/");
  if (serviceSlug) revalidatePath(`/services/${serviceSlug}`);

  return noStoreJson({ ok: true, mode: "deleted" });
}