import { MAX_UPLOAD_BYTES } from "@/lib/cloudinary-limits";

const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.12;
const SCALE_STEP = 0.85;
const MAX_ATTEMPTS = 10;

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export type CompressionStep = { quality: number; width: number; height: number };

// Lowers quality first (cheaper on sharpness for a photo already at full resolution);
// once quality bottoms out, shrinks dimensions instead. Pure so the convergence math
// (does it ever stall, does it always move) can be tested without a real canvas.
export function nextCompressionStep(step: CompressionStep): CompressionStep {
  if (step.quality > MIN_QUALITY) {
    return { ...step, quality: step.quality - QUALITY_STEP };
  }
  return {
    ...step,
    width: Math.round(step.width * SCALE_STEP),
    height: Math.round(step.height * SCALE_STEP),
  };
}

// Re-encodes an oversized image down to Cloudinary's plan-tier upload cap so the
// upload never fails — lowering JPEG quality first, then shrinking dimensions once
// quality bottoms out. Anything already under the cap, or not decodable as an image
// (HEIC, an already-failing file), passes through untouched and lets the real
// Cloudinary error surface instead.
export async function compressImageForUpload(
  file: File | Blob,
  maxBytes: number = MAX_UPLOAD_BYTES,
): Promise<File | Blob> {
  if (file.size <= maxBytes || !file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  let step: CompressionStep = { quality: 0.9, width: bitmap.width, height: bitmap.height };
  let best: Blob | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    canvas.width = step.width;
    canvas.height = step.height;
    ctx.drawImage(bitmap, 0, 0, step.width, step.height);

    const blob = await canvasToJpegBlob(canvas, step.quality);
    if (!blob) break;
    best = blob;
    if (blob.size <= maxBytes) break;

    step = nextCompressionStep(step);
  }

  bitmap.close();

  if (!best) return file;

  const originalName = file instanceof File ? file.name : "upload";
  const name = `${originalName.replace(/\.[^./]+$/, "")}.jpg`;
  return new File([best], name, { type: "image/jpeg" });
}
