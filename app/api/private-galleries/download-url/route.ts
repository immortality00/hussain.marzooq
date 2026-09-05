import {
  findGalleryMedia,
  openUnlockedGallery,
} from "@/app/api/private-galleries/_lib/gallery-access";
import { asNullableString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import {
  cloudinaryFormatFromUrl,
  expiringDownloadUrl,
  normalizeAssetResourceType,
  normalizeDeliveryType,
} from "@/lib/server/cloudinary-private";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const DOWNLOAD_URL_LIMIT = 60;
const DOWNLOAD_URL_WINDOW_MS = 60 * 1000;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const slug = (asNullableString(body.slug) ?? "").trim().slice(0, 100);
  const mediaId = (asNullableString(body.mediaId) ?? "").trim().slice(0, 40);

  if (!slug || !mediaId) {
    return noStoreJson({ ok: false, error: "Gallery and media are required." }, { status: 400 });
  }

  const limit = await consumeFixedWindowRateLimit({
    bucket: "gallery-download-url",
    key: getClientAddress(req),
    limit: DOWNLOAD_URL_LIMIT,
    windowMs: DOWNLOAD_URL_WINDOW_MS,
  });

  if (limit.limited) {
    return noStoreJson(
      { ok: false, error: "Too many downloads. Try again shortly." },
      { status: 429 }
    );
  }

  const unlocked = await openUnlockedGallery(slug);
  if (!unlocked.ok) {
    return noStoreJson({ ok: false, error: "Access denied." }, { status: unlocked.response.status });
  }

  const media = await findGalleryMedia(unlocked.gallery, mediaId);
  const publicId = typeof media?.publicId === "string" ? media.publicId.trim() : "";

  if (!media || !publicId) {
    return noStoreJson({ ok: false, error: "This item cannot be downloaded." }, { status: 404 });
  }

  const format = cloudinaryFormatFromUrl(
    typeof media.secureUrl === "string" ? media.secureUrl : null
  );

  if (!format) {
    return noStoreJson({ ok: false, error: "This item cannot be downloaded." }, { status: 404 });
  }

  try {
    const { url, expiresAt } = expiringDownloadUrl({
      publicId,
      format,
      resourceType: normalizeAssetResourceType(media.resourceType ?? media.type),
      deliveryType: normalizeDeliveryType(media.deliveryType),
    });

    return noStoreJson({ ok: true, url, expiresAt });
  } catch {
    return noStoreJson({ ok: false, error: "Downloads are not configured." }, { status: 500 });
  }
}
