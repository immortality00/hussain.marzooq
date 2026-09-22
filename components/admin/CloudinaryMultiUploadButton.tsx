"use client";

import { useRef, useState } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import type { CloudinaryUploaded } from "@/components/admin/CloudinaryUploadButton";
import { uploadFileToCloudinary } from "@/lib/client/cloudinary-direct-upload";

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
    try {
      const uploaded = await uploadFileToCloudinary(file, folder);
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
