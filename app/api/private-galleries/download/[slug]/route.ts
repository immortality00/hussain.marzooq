import {
  listGalleryMedia,
  openUnlockedGallery,
} from "@/app/api/private-galleries/_lib/gallery-access";
import {
  expiringArchiveUrl,
  fullyQualifiedPublicId,
  normalizeAssetResourceType,
  normalizeDeliveryType,
} from "@/lib/server/cloudinary-private";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  const unlocked = await openUnlockedGallery(slug);
  if (!unlocked.ok) return unlocked.response;

  const mediaDocs = await listGalleryMedia(unlocked.gallery);

  const fullyQualifiedPublicIds = mediaDocs
    .filter((doc) => typeof doc.publicId === "string" && doc.publicId)
    .map((doc) =>
      fullyQualifiedPublicId({
        publicId: doc.publicId as string,
        resourceType: normalizeAssetResourceType(doc.resourceType ?? doc.type),
        deliveryType: normalizeDeliveryType(doc.deliveryType),
      })
    );

  if (fullyQualifiedPublicIds.length === 0) {
    return new Response("No downloadable assets", { status: 400 });
  }

  let archiveUrl: string;
  try {
    archiveUrl = expiringArchiveUrl({
      fullyQualifiedPublicIds,
      targetPublicId: `gallery-${slug}`,
    });
  } catch {
    return new Response("Cloudinary download is not configured", { status: 500 });
  }

  return Response.redirect(archiveUrl, 302);
}
