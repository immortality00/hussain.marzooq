import { uploadResultError } from "@/lib/cloudinary-upload-result";

export type CloudinaryUploaded = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
};

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

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  if (!upRes.ok) throw new Error("Upload failed. Please try again.");
  const data = await upRes.json();

  const rejection = uploadResultError(data);
  if (rejection) throw new Error(rejection);

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
  };
}
