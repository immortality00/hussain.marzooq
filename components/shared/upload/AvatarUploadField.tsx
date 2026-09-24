"use client";

import { useRef, useState } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import {
  uploadFileToCloudinary,
  type CloudinaryUploaded,
  type UploadTarget,
} from "@/lib/client/cloudinary-direct-upload";
import { AvatarCropModal } from "./AvatarCropModal";

export function AvatarUploadField({
  folder,
  label = "Upload avatar",
  disabled = false,
  target,
  className = adminButtonClasses("default", "md"),
  onUploaded,
  onError,
}: {
  folder: string;
  label?: string;
  disabled?: boolean;
  target?: UploadTarget;
  className?: string;
  onUploaded: (uploaded: CloudinaryUploaded) => void;
  onError?: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function closeCrop() {
    if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    setPendingImageUrl(null);
  }

  async function handleCropped(blob: Blob) {
    closeCrop();
    setBusy(true);
    try {
      const uploaded = await uploadFileToCloudinary(blob, folder, target);
      onUploaded(uploaded);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) setPendingImageUrl(URL.createObjectURL(file));
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className={className}
      >
        {busy ? "Uploading…" : label}
      </button>

      {pendingImageUrl ? (
        <AvatarCropModal imageUrl={pendingImageUrl} onCancel={closeCrop} onConfirm={handleCropped} />
      ) : null}
    </>
  );
}
