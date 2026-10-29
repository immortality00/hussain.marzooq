import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/server/db";
import {
  galleryVisibilityOf,
  galleryLinkOpens,
  isPrivateGalleryUnavailable,
  privateGalleryCookieName,
  verifyPrivateGalleryCookieValue,
} from "@/lib/private-galleries";

export type UnlockedGallery = {
  id: string;
  slug: string;
  mediaIds: string[];
  // Set for a public gallery only: the per-link limits count under it, so a new link starts
  // its counts over. The key itself is never stored in a counter.
  linkLimitKey: string | null;
};

async function hasCookieAccess(doc: Record<string, unknown>) {
  const id = String(doc._id);
  const accessToken = typeof doc.accessToken === "string" ? doc.accessToken : "";
  const jar = await cookies();
  const cookieValue = jar.get(privateGalleryCookieName(id))?.value ?? "";
  return verifyPrivateGalleryCookieValue({ galleryId: id, accessToken, cookieValue });
}

function linkLimitKeyOf(id: string, linkKey: string) {
  return `${id}:${createHash("sha256").update(linkKey).digest("hex").slice(0, 16)}`;
}

// A private gallery opens with its password cookie only; a public gallery with its link key only.
export async function openUnlockedGallery(
  slug: string,
  key?: string | null
): Promise<{ ok: true; gallery: UnlockedGallery } | { ok: false; response: Response }> {
  const db = await getDb();
  const doc = await db.collection("private_galleries").findOne({ slug });

  if (!doc) return { ok: false, response: new Response("Not found", { status: 404 }) };
  if (isPrivateGalleryUnavailable(doc as Record<string, unknown>)) {
    return { ok: false, response: new Response("Unavailable", { status: 403 }) };
  }

  const id = String(doc._id);
  const isLink = galleryVisibilityOf(doc) === "public";
  const allowed = isLink ? galleryLinkOpens(doc, key) : await hasCookieAccess(doc);
  if (!allowed) return { ok: false, response: new Response("Forbidden", { status: 403 }) };

  const mediaIds = Array.isArray(doc.mediaIds)
    ? doc.mediaIds.filter((value): value is string => typeof value === "string")
    : [];

  return {
    ok: true,
    gallery: { id, slug, mediaIds, linkLimitKey: isLink ? linkLimitKeyOf(id, key as string) : null },
  };
}

export async function findGalleryMedia(gallery: UnlockedGallery, mediaId: string) {
  if (!ObjectId.isValid(mediaId)) return null;
  if (!gallery.mediaIds.includes(mediaId)) return null;

  const db = await getDb();
  return db.collection("media").findOne({ _id: new ObjectId(mediaId) });
}

export async function listGalleryMedia(gallery: UnlockedGallery) {
  const objectIds = gallery.mediaIds
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  if (objectIds.length === 0) return [];

  const db = await getDb();
  return db.collection("media").find({ _id: { $in: objectIds } }).toArray();
}
