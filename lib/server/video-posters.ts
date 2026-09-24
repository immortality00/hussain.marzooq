import { v2 as cloudinary } from "cloudinary";
import type { Db } from "mongodb";
import { CLOUDINARY_MEDIA_POSTERS_FOLDER } from "@/lib/cloudinary-folders";
import { uploadResultError, type CloudinaryUploadResponse } from "@/lib/cloudinary-upload-result";
import { ensureCloudinaryConfigured, isCloudinaryConfigured } from "@/lib/server/cloudinary";
import { deleteManagedCloudinaryAsset } from "@/lib/server/cloudinary-assets";
import { discardPendingUpload, newUploadPublicId, registerAssetUpload } from "@/lib/server/upload-ledger";
import { videoWatchUrl, type VideoRef } from "@/lib/video-embed";

const FETCH_TIMEOUT_MS = 6_000;
const UPLOAD_TIMEOUT_MS = 20_000;
const PREVIEW_MAX_BYTES = 200_000;
const PREVIEW_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const YOUTUBE_SIZES = ["maxresdefault", "sddefault", "hqdefault"] as const;
const LETTERBOX_CROP = [{ aspect_ratio: "16:9", crop: "fill", gravity: "center" }];

type Thumbnail = { url: string; letterboxed: boolean };

export type VideoPoster = { url: string; publicId: string };
export type VideoPreview = { title: string | null; preview: string | null };

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function isAvailable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function oEmbed(ref: VideoRef, width: number) {
  const target = encodeURIComponent(videoWatchUrl(ref));
  return fetchJson(
    ref.provider === "youtube"
      ? `https://www.youtube.com/oembed?format=json&url=${target}`
      : `https://vimeo.com/api/oembed.json?width=${width}&url=${target}`
  );
}

function titleOf(data: Record<string, unknown> | null): string | null {
  const title = typeof data?.title === "string" ? data.title.trim() : "";
  return title ? title.slice(0, 160) : null;
}

function vimeoThumbnailUrl(data: Record<string, unknown> | null): string | null {
  try {
    const url = new URL(typeof data?.thumbnail_url === "string" ? data.thumbnail_url : "");
    return url.protocol === "https:" && url.hostname === "i.vimeocdn.com" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function bestThumbnail(ref: VideoRef): Promise<Thumbnail | null> {
  if (ref.provider === "vimeo") {
    const url = vimeoThumbnailUrl(await oEmbed(ref, 1280));
    return url ? { url, letterboxed: false } : null;
  }

  for (const size of YOUTUBE_SIZES) {
    const url = `https://i.ytimg.com/vi/${ref.id}/${size}.jpg`;
    if (await isAvailable(url)) return { url, letterboxed: size !== "maxresdefault" };
  }
  return null;
}

async function toDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: "no-store" });
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!res.ok || !PREVIEW_TYPES.has(type)) return null;

    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length === 0 || bytes.length > PREVIEW_MAX_BYTES) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function fetchVideoPreview(ref: VideoRef): Promise<VideoPreview> {
  const data = await oEmbed(ref, 320);
  const imageUrl =
    ref.provider === "youtube" ? `https://i.ytimg.com/vi/${ref.id}/mqdefault.jpg` : vimeoThumbnailUrl(data);

  return { title: titleOf(data), preview: imageUrl ? await toDataUri(imageUrl) : null };
}

export async function storeVideoPoster(db: Db, ref: VideoRef): Promise<VideoPoster | null> {
  if (!isCloudinaryConfigured()) return null;

  const thumbnail = await bestThumbnail(ref);
  if (!thumbnail) return null;

  const publicId = newUploadPublicId(CLOUDINARY_MEDIA_POSTERS_FOLDER);

  try {
    await registerAssetUpload(db, publicId);
    ensureCloudinaryConfigured();

    const result = (await cloudinary.uploader.upload(thumbnail.url, {
      public_id: publicId,
      resource_type: "image",
      overwrite: false,
      timeout: UPLOAD_TIMEOUT_MS,
      ...(thumbnail.letterboxed ? { transformation: LETTERBOX_CROP } : {}),
    })) as CloudinaryUploadResponse;

    const problem = uploadResultError(result) ?? (result.public_id === publicId ? null : "Unexpected public id.");
    if (problem) throw new Error(problem);

    return { url: result.secure_url as string, publicId };
  } catch (error) {
    console.error("[video-posters] poster upload failed", publicId, error);
    await discardUnsavedPoster(db, publicId);
    return null;
  }
}

export async function discardUnsavedPoster(db: Db, publicId: string | null | undefined) {
  if (!publicId) return;
  await discardPendingUpload(db, publicId).catch((error: unknown) => {
    console.error("[video-posters] discard failed", publicId, error);
  });
}

export async function deleteVideoPoster(publicId: unknown) {
  if (typeof publicId !== "string" || !publicId) return;

  const deleted = await deleteManagedCloudinaryAsset(
    { publicId, resourceType: "image" },
    [CLOUDINARY_MEDIA_POSTERS_FOLDER]
  );
  if (!deleted) console.error("[video-posters] could not delete poster", publicId);
}
