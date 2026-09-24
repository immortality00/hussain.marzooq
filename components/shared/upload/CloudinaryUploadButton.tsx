"use client";

import { useRef, useState } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { uploadFileToCloudinary, type CloudinaryUploaded } from "@/lib/client/cloudinary-direct-upload";

export type { CloudinaryUploaded };

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
      const uploaded = await uploadFileToCloudinary(file, folder);
      onUploaded(uploaded);
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
