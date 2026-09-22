import { uploadResultError } from "@/lib/cloudinary-upload-result";

export type CloudinaryUploaded = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
};

type SignedParams = {
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

// Cloudinary rejects a single non-chunked upload over 100MB outright, which is what
// forced re-uploading a full-resolution camera file. Anything under that goes through
// unchanged; only files that would actually hit the cap pay for chunking.
const CHUNK_UPLOAD_THRESHOLD = 100 * 1024 * 1024;
const CHUNK_SIZE = 20 * 1024 * 1024;

export function computeChunkRanges(totalBytes: number, chunkSize: number) {
  const ranges: { start: number; end: number }[] = [];
  for (let start = 0; start < totalBytes; start += chunkSize) {
    ranges.push({ start, end: Math.min(start + chunkSize, totalBytes) });
  }
  return ranges;
}

function buildForm(file: File | Blob, { apiKey, timestamp, folder, signature }: SignedParams) {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);
  return form;
}

async function uploadWhole(file: File | Blob, endpoint: string, params: SignedParams) {
  const res = await fetch(endpoint, { method: "POST", body: buildForm(file, params) });
  if (!res.ok) throw new Error("Upload failed. Please try again.");
  return res.json();
}

async function uploadInChunks(file: File | Blob, endpoint: string, params: SignedParams) {
  const uploadId = crypto.randomUUID();
  let data: unknown = null;

  for (const { start, end } of computeChunkRanges(file.size, CHUNK_SIZE)) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Unique-Upload-Id": uploadId,
        "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
      },
      body: buildForm(file.slice(start, end), params),
    });
    if (!res.ok) throw new Error("Upload failed. Please try again.");
    data = await res.json();
  }

  return data;
}

export async function uploadFileToCloudinary(
  file: File | Blob,
  folder: string,
): Promise<CloudinaryUploaded> {
  const timestamp = Math.round(Date.now() / 1000);

  const signRes = await fetch("/api/sign-cloudinary-params", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign: { folder, timestamp } }),
  });
  if (!signRes.ok) throw new Error("Could not authorize the upload.");
  const { signature, cloudName, apiKey } = await signRes.json();

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const params: SignedParams = { apiKey, timestamp, folder, signature };
  const data =
    file.size > CHUNK_UPLOAD_THRESHOLD
      ? await uploadInChunks(file, endpoint, params)
      : await uploadWhole(file, endpoint, params);

  const rejection = uploadResultError(data);
  if (rejection) throw new Error(rejection);

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
  };
}
