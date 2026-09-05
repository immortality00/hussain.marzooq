import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/server/db";
import {
  isPrivateGalleryUnavailable,
  privateGalleryCookieName,
  verifyPrivateGalleryCookieValue,
} from "@/lib/private-galleries";

export type UnlockedGallery = {
  id: string;
  slug: string;
  mediaIds: string[];
};

export async function openUnlockedGallery(
  slug: string
): Promise<{ ok: true; gallery: UnlockedGallery } | { ok: false; response: Response }> {
  const db = await getDb();
  const doc = await db.collection("private_galleries").findOne({ slug });

  if (!doc) return { ok: false, response: new Response("Not found", { status: 404 }) };
  if (isPrivateGalleryUnavailable(doc as Record<string, unknown>)) {
    return { ok: false, response: new Response("Unavailable", { status: 403 }) };
  }

  const id = String(doc._id);
  const accessToken = typeof doc.accessToken === "string" ? doc.accessToken : "";
  const jar = await cookies();
  const cookieValue = jar.get(privateGalleryCookieName(id))?.value ?? "";

  if (!verifyPrivateGalleryCookieValue({ galleryId: id, accessToken, cookieValue })) {
    return { ok: false, response: new Response("Forbidden", { status: 403 }) };
  }

  const mediaIds = Array.isArray(doc.mediaIds)
    ? doc.mediaIds.filter((value): value is string => typeof value === "string")
    : [];

  return { ok: true, gallery: { id, slug, mediaIds } };
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
