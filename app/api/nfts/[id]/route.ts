import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import {
  asBooleanOrNull,
  asNullableString,
  asNumberOrNull,
  isRecord,
  noStoreJson,
  normalizeSlug,
  parseObjectId,
} from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

function normalizeMediaType(v: string | null): "image" | "video" {
  return v === "video" ? "video" : "image";
}

function normalizeEditionType(v: string | null): "1/1" | "limited" | "open" {
  if (v === "limited" || v === "open") return v;
  return "1/1";
}

function normalizeStatus(v: string | null): "available" | "sold" | "coming-soon" {
  if (v === "sold" || v === "coming-soon") return v;
  return "available";
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const existing = await db.collection("nft_items").findOne({ _id: oid });
  if (!existing) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.slug === "string") patch.slug = normalizeSlug(body.slug);
  if (typeof body.description === "string") patch.description = body.description.trim();
  if (typeof body.mediaUrl === "string") patch.mediaUrl = body.mediaUrl.trim();
  if ("mediaType" in body) patch.mediaType = normalizeMediaType(asNullableString(body.mediaType));
  if ("price" in body) patch.price = asNumberOrNull(body.price);
  if (typeof body.currency === "string") patch.currency = body.currency.trim() || "ETH";
  if ("editionType" in body) patch.editionType = normalizeEditionType(asNullableString(body.editionType));
  if ("editionsTotal" in body) patch.editionsTotal = asNumberOrNull(body.editionsTotal);
  if ("editionsRemaining" in body) patch.editionsRemaining = asNumberOrNull(body.editionsRemaining);
  if ("status" in body) patch.status = normalizeStatus(asNullableString(body.status));
  if ("marketplaceName" in body) patch.marketplaceName = (asNullableString(body.marketplaceName) ?? "").trim() || null;
  if ("marketplaceUrl" in body) {
    const next = (asNullableString(body.marketplaceUrl) ?? "").trim();
    if (next && !next.startsWith("https://")) {
      return noStoreJson({ ok: false, error: "Marketplace URL must start with https://" }, { status: 400 });
    }
    patch.marketplaceUrl = next || null;
  }
  if ("isPublished" in body) patch.isPublished = asBooleanOrNull(body.isPublished) ?? true;
  if ("order" in body) patch.order = asNumberOrNull(body.order) ?? 0;

  if (typeof patch.slug === "string") {
    const slug = patch.slug;
    if (!slug || slug.includes(" ")) return noStoreJson({ ok: false, error: "Invalid slug" }, { status: 400 });
    const conflict = await db.collection("nft_items").findOne({ slug, _id: { $ne: oid } }, { projection: { _id: 1 } });
    if (conflict) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });
  }

  await db.collection("nft_items").updateOne({ _id: oid }, { $set: patch });
  return noStoreJson({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const result = await db.collection("nft_items").deleteOne({ _id: oid });
  if (!result.deletedCount) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  return noStoreJson({ ok: true });
}