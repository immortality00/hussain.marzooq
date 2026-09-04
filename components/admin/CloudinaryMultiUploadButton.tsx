"use client";

import { useRef, useState } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import type { CloudinaryUploaded } from "@/components/admin/CloudinaryUploadButton";

export type CloudinaryUploadedFile = CloudinaryUploaded & {
  originalFilename: string;
};

export function CloudinaryMultiUploadButton({
  folder,
  accept = "image/*,video/*",
  label = "Choose files",
  disabled = false,
  maxFiles = 50,
  onUploaded,
  onError,
}: {
  folder: string;
  accept?: string;
  label?: string;
  disabled?: boolean;
  maxFiles?: number;
  onUploaded: (files: CloudinaryUploadedFile[]) => void;
  onError?: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  async function uploadOne(file: File): Promise<CloudinaryUploadedFile> {
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
    if (!upRes.ok) throw new Error(`Upload failed for ${file.name}.`);
    const data = await upRes.json();

    if (!data.secure_url || !data.public_id || !data.resource_type) {
      throw new Error(`Upload did not complete for ${file.name}.`);
    }

    return {
      secureUrl: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type,
      originalFilename: file.name,
    };
  }

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList).slice(0, maxFiles);
    if (files.length === 0) return;

    setProgress({ done: 0, total: files.length });
    const uploaded: CloudinaryUploadedFile[] = [];
    let failures = 0;

    for (const file of files) {
      try {
        uploaded.push(await uploadOne(file));
      } catch (error) {
        failures += 1;
        onError?.(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
      }
    }

    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";

    if (uploaded.length > 0) onUploaded(uploaded);
    if (failures > 0 && uploaded.length === 0) {
      onError?.("None of the files uploaded.");
    }
  }

  const busy = progress !== null;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (files && files.length) void handleFiles(files);
        }}
      />
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className={adminButtonClasses("default", "md")}
      >
        {busy ? `Uploading ${progress?.done}/${progress?.total}…` : label}
      </button>
    </>
  );
}
