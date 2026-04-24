import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeSlug(v: string): string {
  return v.trim().toLowerCase();
}

function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminOr401();
  if (guard) return guard as unknown as Response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) {
    return noStore({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const existing = await db.collection("services").findOne({ _id: new ObjectId(id) });
  if (!existing) {
    return noStore({ ok: false, error: "Not found" }, { status: 404 });
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.slug === "string") patch.slug = normalizeSlug(body.slug);
  if (typeof body.description === "string") patch.description = body.description.trim();
  if (typeof body.currency === "string") patch.currency = body.currency.trim() || "AED";
  if (typeof body.imageUrl === "string") patch.imageUrl = body.imageUrl.trim();
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (typeof body.isArchived === "boolean") patch.isArchived = body.isArchived;

  const sp = body.startingPrice === null ? null : asNumberOrNull(body.startingPrice);
  if (body.startingPrice === null) patch.startingPrice = null;
  else if (sp !== null) patch.startingPrice = sp;

  const order = asFiniteNumber(body.order);
  if (order !== null) patch.order = order;

  if (typeof body.category === "string") {
    const requestedCategory = normalizeSlug(body.category || "others") || "others";

    if (requestedCategory === "others") {
      const others = await db.collection("service_categories").findOne(
        { slug: "others" },
        { projection: { _id: 1 } }
      );

      patch.category = "others";
      patch.categoryId = others ? String(others._id) : null;
    } else {
      const cat = await db.collection("service_categories").findOne(
        { slug: requestedCategory },
        { projection: { _id: 1, slug: 1, isActive: 1 } }
      );

      if (!cat) {
        return noStore({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
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
    return noStore({ ok: false, error: "SERVICE_ARCHIVED" }, { status: 409 });
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
        return noStore({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
      }

      const cat = await db.collection("service_categories").findOne(
        { _id: new ObjectId(nextCategoryId) },
        { projection: { _id: 1, slug: 1, isActive: 1 } }
      );

      if (!cat) {
        return noStore({ ok: false, error: "CATEGORY_NOT_FOUND" }, { status: 400 });
      }

      if (cat.isActive === false) {
        return noStore({ ok: false, error: "CATEGORY_INACTIVE" }, { status: 409 });
      }

      patch.category = typeof cat.slug === "string" ? normalizeSlug(cat.slug) : nextCategorySlug;
      patch.categoryId = String(cat._id);
    }
  }

  if ("slug" in patch) {
    const slug = asString(patch.slug).trim();
    if (!slug || slug.includes(" ")) {
      return noStore({ ok: false, error: "Invalid slug" }, { status: 400 });
    }

    const conflict = await db.collection("services").findOne({
      slug,
      _id: { $ne: new ObjectId(id) },
    });
    if (conflict) {
      return noStore({ ok: false, error: "Slug already exists" }, { status: 409 });
    }
  }

  await db.collection("services").updateOne({ _id: new ObjectId(id) }, { $set: patch });
  return noStore({ ok: true });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminOr401();
  if (guard) return guard as unknown as Response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) {
    return noStore({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const url = new URL(req.url);
  const hard = url.searchParams.get("hard") === "1";

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  if (!hard) {
    await db.collection("services").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isArchived: true, isActive: false, updatedAt: new Date() } }
    );
    return noStore({ ok: true, mode: "archived" });
  }

  const inquiriesCount = await db.collection("inquiries").countDocuments({ serviceId: id });
  if (inquiriesCount > 0) {
    return noStore({ ok: false, error: "SERVICE_HAS_INQUIRIES", inquiriesCount }, { status: 409 });
  }

  await db.collection("services").deleteOne({ _id: new ObjectId(id) });
  return noStore({ ok: true, mode: "deleted" });
}