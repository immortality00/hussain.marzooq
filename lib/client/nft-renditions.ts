import { DISPLAY_LONG_EDGE, THUMBNAIL_LONG_EDGE } from "@/lib/nft/mint-fields";

// The two smaller versions pinned beside an artwork's original: the display version marketplaces
// show and the thumbnail wallets show. Made in the browser, so the original never passes the server.

export type Size = { width: number; height: number };
export type Rendition = Size & { blob: Blob };
export type Renditions = { original: Size; display: Rendition; thumbnail: Rendition };

const JPEG_QUALITY = 0.9;

/** The size that fits inside `edge` on its long side. Never enlarges. */
export function fitWithin(size: Size, edge: number): Size {
  const long = Math.max(size.width, size.height);
  if (long <= edge) return { width: size.width, height: size.height };
  const scale = edge / long;
  return { width: Math.max(1, Math.round(size.width * scale)), height: Math.max(1, Math.round(size.height * scale)) };
}

async function drawn(source: CanvasImageSource, from: Size, edge: number): Promise<Rendition> {
  const size = fitWithin(from, edge);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not draw the image.");
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, size.width, size.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  if (!blob) throw new Error("This browser could not make the smaller versions.");
  return { ...size, blob };
}

async function firstFrame(file: File): Promise<{ video: HTMLVideoElement; release: () => void }> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  const release = () => URL.revokeObjectURL(url);
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("This browser cannot read the video."));
    });
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      video.currentTime = Math.min(0.1, (video.duration || 1) / 2);
    });
    return { video, release };
  } catch (error) {
    release();
    throw error;
  }
}

export async function makeRenditions(file: File): Promise<Renditions> {
  if (file.type.startsWith("video/")) {
    const { video, release } = await firstFrame(file);
    try {
      const original = { width: video.videoWidth, height: video.videoHeight };
      return {
        original,
        display: await drawn(video, original, DISPLAY_LONG_EDGE),
        thumbnail: await drawn(video, original, THUMBNAIL_LONG_EDGE),
      };
    } finally {
      release();
    }
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This browser cannot read the file. Use a JPEG, PNG or WebP original.");
  }
  try {
    const original = { width: bitmap.width, height: bitmap.height };
    return {
      original,
      display: await drawn(bitmap, original, DISPLAY_LONG_EDGE),
      thumbnail: await drawn(bitmap, original, THUMBNAIL_LONG_EDGE),
    };
  } finally {
    bitmap.close();
  }
}
