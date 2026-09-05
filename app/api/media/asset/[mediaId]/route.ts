import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { getDb } from "@/lib/server/db";
import {
  isPrivateGalleryUnavailable,
  privateGalleryCookieName,
  verifyPrivateGalleryCookieValue,
} from "@/lib/private-galleries";
import {
  normalizeAssetResourceType,
  normalizeDeliveryType,
  signedDeliveryUrl,
} from "@/lib/server/cloudinary-private";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const ASSET_REQUEST_LIMIT = 300;
const ASSET_REQUEST_WINDOW_MS = 60 * 1000;
const MIN_WIDTH = 16;
const MAX_WIDTH = 3840;

function parseWidth(value: string | null) {
  const width = Number(value);
  if (!Number.isFinite(width)) return null;
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(width)));
}

async function hasGalleryAccess(mediaId: string, slug: string) {
  const db = await getDb();
  const gallery = await db.collection("private_galleries").findOne({ slug });
  if (!gallery) return false;
  if (isPrivateGalleryUnavailable(gallery as Record<string, unknown>)) return false;

  const mediaIds = Array.isArray(gallery.mediaIds) ? gallery.mediaIds : [];
  if (!mediaIds.includes(mediaId)) return false;

  const galleryId = String(gallery._id);
  const accessToken = typeof gallery.accessToken === "string" ? gallery.accessToken : "";
  const jar = await cookies();
  const cookieValue = jar.get(privateGalleryCookieName(galleryId))?.value ?? "";

  return verifyPrivateGalleryCookieValue({ galleryId, accessToken, cookieValue });
}

export async function GET(req: Request, ctx: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await ctx.params;
  if (!ObjectId.isValid(mediaId)) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const gallerySlug = (url.searchParams.get("g") ?? "").trim().slice(0, 100);
  const isAdmin = await isAdminAuthedServer();

  if (!isAdmin) {
    const limit = await consumeFixedWindowRateLimit({
      bucket: "gallery-asset",
      key: getClientAddress(req),
      limit: ASSET_REQUEST_LIMIT,
      windowMs: ASSET_REQUEST_WINDOW_MS,
    });

    if (limit.limited) return new Response("Too many requests", { status: 429 });
    if (!gallerySlug) return new Response("Forbidden", { status: 403 });
    if (!(await hasGalleryAccess(mediaId, gallerySlug))) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const db = await getDb();
  const media = await db.collection("media").findOne({ _id: new ObjectId(mediaId) });
  if (!media) return new Response("Not found", { status: 404 });

  const publicId = typeof media.publicId === "string" ? media.publicId.trim() : "";
  if (!publicId) return new Response("Not found", { status: 404 });

  let deliveryUrl: string;
  try {
    deliveryUrl = signedDeliveryUrl({
      publicId,
      resourceType: normalizeAssetResourceType(media.resourceType ?? media.type),
      deliveryType: normalizeDeliveryType(media.deliveryType),
      width: parseWidth(url.searchParams.get("w")),
    });
  } catch {
    return new Response("Cloudinary is not configured", { status: 500 });
  }

  const range = req.headers.get("range");
  const upstream = await fetch(deliveryUrl, {
    headers: range ? { Range: range } : undefined,
    cache: "no-store",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Asset unavailable", { status: 502 });
  }

  const headers = new Headers({ "Cache-Control": "private, max-age=300" });
  for (const header of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }
  if (!headers.has("accept-ranges")) headers.set("Accept-Ranges", "bytes");

  return new Response(upstream.body, { status: upstream.status, headers });
}
