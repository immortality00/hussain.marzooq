"use client";

import { useRef, useState } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";

export type CloudinaryUploaded = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
};

export function CloudinaryUploadButton({
  folder,
  accept = "image/*,video/*",
  label = "Choose file",
  disabled = false,
  onUploaded,
  onError,
}: {
  folder: string;
  accept?: string;
  label?: string;
  disabled?: boolean;
  onUploaded: (uploaded: CloudinaryUploaded) => void;
  onError?: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
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

      if (!data.secure_url || !data.public_id || !data.resource_type) {
        throw new Error("Upload did not complete.");
      }
      onUploaded({
        secureUrl: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type,
      });
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className={adminButtonClasses("default", "md")}
      >
        {busy ? "Uploading…" : label}
      </button>
    </>
  );
}
