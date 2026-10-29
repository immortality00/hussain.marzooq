import {
  listGalleryMedia,
  openUnlockedGallery,
} from "@/app/api/private-galleries/_lib/gallery-access";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import {
  expiringArchiveUrl,
  fullyQualifiedPublicId,
  normalizeAssetResourceType,
  normalizeDeliveryType,
} from "@/lib/server/cloudinary-private";
import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { noStoreJson } from "@/app/api/_lib/common";
import { LINK_DOWNLOADS_USED_UP_TEXT, consumeLinkDownloads } from "@/lib/server/gallery-link-limits";

export const dynamic = "force-dynamic";

const ARCHIVE_RATE_LIMIT_MAX = 10;
const ARCHIVE_RATE_LIMIT_WINDOW_MS = 60_000;

// `?format=json` answers { ok, url } (or { ok:false, error }) so the gallery page can show a
// refusal in words; without it the route redirects straight to the archive, as before.
function refuse(asJson: boolean, error: string, status: number) {
  return asJson ? noStoreJson({ ok: false, error }, { status }) : new Response(error, { status });
}

async function handleGet(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const params = new URL(req.url).searchParams;
  const asJson = params.get("format") === "json";
  const linkKey = (params.get("k") ?? "").trim().slice(0, 100);

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "gallery-zip",
    key: getClientAddress(req),
    limit: ARCHIVE_RATE_LIMIT_MAX,
    windowMs: ARCHIVE_RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) return refuse(asJson, "Too many downloads. Try again shortly.", 429);

  const { slug } = await ctx.params;

  const unlocked = await openUnlockedGallery(slug.slice(0, 100), linkKey || null);
  if (!unlocked.ok) return asJson ? refuse(true, "Access denied.", unlocked.response.status) : unlocked.response;

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
    return refuse(asJson, "No downloadable assets", 400);
  }

  let archiveUrl: string;
  try {
    archiveUrl = expiringArchiveUrl({
      fullyQualifiedPublicIds,
      targetPublicId: `gallery-${unlocked.gallery.slug}`,
    });
  } catch {
    return refuse(asJson, "Cloudinary download is not configured", 500);
  }

  const downloads = await consumeLinkDownloads(unlocked.gallery, fullyQualifiedPublicIds.length);
  if (downloads.limited) return refuse(asJson, LINK_DOWNLOADS_USED_UP_TEXT, 429);

  return asJson ? noStoreJson({ ok: true, url: archiveUrl }) : Response.redirect(archiveUrl, 302);
}

export const GET = withRouteErrors(handleGet);
