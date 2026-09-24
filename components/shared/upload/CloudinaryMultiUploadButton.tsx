"use client";

import { useRef, useState } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import type { CloudinaryUploaded } from "@/components/shared/upload/CloudinaryUploadButton";
import { uploadFileToCloudinary, type UploadTarget } from "@/lib/client/cloudinary-direct-upload";

export type CloudinaryUploadedFile = CloudinaryUploaded & {
  originalFilename: string;
};

export function CloudinaryMultiUploadButton({
  folder,
  accept = "image/*,video/*",
  label = "Choose files",
  disabled = false,
  maxFiles = 50,
  target,
  className = adminButtonClasses("default", "md"),
  onUploaded,
  onError,
}: {
  folder: string;
  accept?: string;
  label?: string;
  disabled?: boolean;
  maxFiles?: number;
  target?: UploadTarget;
  className?: string;
  onUploaded: (files: CloudinaryUploadedFile[]) => void;
  onError?: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  async function uploadOne(file: File): Promise<CloudinaryUploadedFile> {
    try {
      const uploaded = await uploadFileToCloudinary(file, folder, target);
      return { ...uploaded, originalFilename: file.name };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      throw new Error(`${file.name}: ${message}`);
    }
  }

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList).slice(0, maxFiles);
    if (files.length === 0) return;

    setProgress({ done: 0, total: files.length });
    let uploadedCount = 0;

    for (const file of files) {
      try {
        onUploaded([await uploadOne(file)]);
        uploadedCount += 1;
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
      }
    }

    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";

    if (uploadedCount === 0) onError?.("None of the files uploaded.");
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
        className={className}
      >
        {busy ? `Uploading ${progress?.done}/${progress?.total}…` : label}
      </button>
    </>
  );
}
