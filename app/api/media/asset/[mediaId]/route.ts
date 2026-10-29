import { ObjectId } from "mongodb";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { isProxiedMediaType } from "@/app/api/_lib/proxy-content-type";
import { getDb } from "@/lib/server/db";
import { openUnlockedGallery } from "@/app/api/private-galleries/_lib/gallery-access";
import { consumeLinkView } from "@/lib/server/gallery-link-limits";
import {
  normalizeAssetResourceType,
  normalizeDeliveryType,
  signedDeliveryUrl,
} from "@/lib/server/cloudinary-private";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { personCanOpenMedia } from "@/lib/server/person-gate-media";

export const dynamic = "force-dynamic";

const ASSET_REQUEST_LIMIT = 300;
const ASSET_REQUEST_WINDOW_MS = 60 * 1000;
const MIN_WIDTH = 16;
const MAX_WIDTH = 3840;
// A public gallery's visitor keeps each file for a day, so reopening the link costs no
// function call; a private gallery keeps the short cache it always had.
const PRIVATE_CACHE = "private, max-age=300";
const LINK_CACHE = "private, max-age=86400";

function parseWidth(value: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return null;

  const width = Number(raw);
  if (!Number.isFinite(width)) return null;
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(width)));
}

type Access = { allowed: false; status: 403 | 429 } | { allowed: true; cache: string };

async function galleryAccess(mediaId: string, slug: string, key: string): Promise<Access> {
  const unlocked = await openUnlockedGallery(slug, key || null);
  if (!unlocked.ok || !unlocked.gallery.mediaIds.includes(mediaId)) return { allowed: false, status: 403 };
  if (!unlocked.gallery.linkLimitKey) return { allowed: true, cache: PRIVATE_CACHE };

  const views = await consumeLinkView(unlocked.gallery);
  return views.limited ? { allowed: false, status: 429 } : { allowed: true, cache: LINK_CACHE };
}

async function personAccess(mediaId: string, slug: string): Promise<Access> {
  return (await personCanOpenMedia(await getDb(), slug, mediaId))
    ? { allowed: true, cache: PRIVATE_CACHE }
    : { allowed: false, status: 403 };
}

async function handleGet(req: Request, ctx: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await ctx.params;
  if (!ObjectId.isValid(mediaId)) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const gallerySlug = (url.searchParams.get("g") ?? "").trim().slice(0, 100);
  const linkKey = (url.searchParams.get("k") ?? "").trim().slice(0, 100);
  const personSlug = (url.searchParams.get("p") ?? "").trim().slice(0, 100);
  const isAdmin = await isAdminAuthedServer();
  let cacheControl = PRIVATE_CACHE;

  if (!isAdmin) {
    const limit = await consumeFixedWindowRateLimit({
      bucket: "gallery-asset",
      key: getClientAddress(req),
      limit: ASSET_REQUEST_LIMIT,
      windowMs: ASSET_REQUEST_WINDOW_MS,
    });

    if (limit.limited) return new Response("Too many requests", { status: 429 });
    const access = gallerySlug
      ? await galleryAccess(mediaId, gallerySlug, linkKey)
      : await personAccess(mediaId, personSlug);
    if (!access.allowed) {
      return new Response(access.status === 429 ? "Too many requests" : "Forbidden", { status: access.status });
    }
    cacheControl = access.cache;
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

  if ((!upstream.ok && upstream.status !== 206) || !isProxiedMediaType(upstream.headers.get("content-type"))) {
    return new Response("Asset unavailable", { status: 502 });
  }

  const headers = new Headers({ "Cache-Control": cacheControl });
  for (const header of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }
  if (!headers.has("accept-ranges")) headers.set("Accept-Ranges", "bytes");

  return new Response(upstream.body, { status: upstream.status, headers });
}

export const GET = withRouteErrors(handleGet);
