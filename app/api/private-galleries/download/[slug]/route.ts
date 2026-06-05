import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import { getDb } from "@/lib/server/db";
import {
  isPrivateGalleryUnavailable,
  privateGalleryCookieName,
  verifyPrivateGalleryCookieValue,
} from "@/lib/private-galleries";
import { ensureCloudinaryConfigured } from "@/lib/server/cloudinary";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  const db = await getDb();

  const gallery = await db.collection("private_galleries").findOne({ slug });
  if (!gallery) {
    return new Response("Not found", { status: 404 });
  }

  if (isPrivateGalleryUnavailable(gallery as Record<string, unknown>)) {
    return new Response("Unavailable", { status: 403 });
  }

  const galleryId = String(gallery._id);
  const accessToken = typeof gallery.accessToken === "string" ? gallery.accessToken : "";
  const jar = await cookies();
  const cookieValue = jar.get(privateGalleryCookieName(galleryId))?.value ?? "";
  const hasAccess = verifyPrivateGalleryCookieValue({ galleryId, accessToken, cookieValue });

  if (!hasAccess) {
    return new Response("Forbidden", { status: 403 });
  }

  const mediaIds = Array.isArray(gallery.mediaIds)
    ? gallery.mediaIds.filter((x): x is string => typeof x === "string")
    : [];

  const objectIds = mediaIds.filter((x) => ObjectId.isValid(x)).map((x) => new ObjectId(x));
  const mediaDocs = objectIds.length
    ? await db.collection("media").find({ _id: { $in: objectIds } }).toArray()
    : [];

  const fullyQualifiedPublicIds = mediaDocs
    .filter((doc) => typeof doc.publicId === "string" && doc.publicId)
    .map((doc) => {
      const resourceType =
        typeof doc.resourceType === "string" && doc.resourceType
          ? doc.resourceType
          : typeof doc.type === "string" && doc.type === "video"
            ? "video"
            : "image";

      return `${resourceType}/upload/${doc.publicId}`;
    });

  if (fullyQualifiedPublicIds.length === 0) {
    return new Response("No downloadable assets", { status: 400 });
  }

  try {
    ensureCloudinaryConfigured();
  } catch {
    return new Response("Cloudinary download is not configured", { status: 500 });
  }

  const archiveUrl = cloudinary.utils.download_zip_url({
    fully_qualified_public_ids: fullyQualifiedPublicIds,
    flatten_folders: true,
    use_original_filename: true,
    target_public_id: `gallery-${slug}`,
    sign_url: true,
  });

  return Response.redirect(archiveUrl, 302);
}