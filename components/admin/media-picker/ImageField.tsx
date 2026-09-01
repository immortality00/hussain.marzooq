"use client";

import Image from "next/image";
import { useState } from "react";
import { CLOUDINARY_SECTIONS_FOLDER } from "@/lib/cloudinary-folders";
import { EMPTY_SECTION_IMAGE } from "@/lib/page-sections-shared";
import type { SectionImage } from "@/lib/page-sections-shared";
import { MediaPickerModal } from "./MediaPickerModal";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { CloudinaryUploadButton } from "@/components/admin/CloudinaryUploadButton";

// Reusable admin image control: pick an existing library image OR upload a new
// one to Cloudinary, plus remove. Uploaded images carry a publicId (cleaned up
// on replace by the save routes); picked images do not.
export function ImageField({
  label,
  value,
  onChange,
  folder = CLOUDINARY_SECTIONS_FOLDER,
}: {
  label?: string;
  value: SectionImage | undefined;
  onChange: (image: SectionImage) => void;
  folder?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const image = value ?? EMPTY_SECTION_IMAGE;

  return (
    <div className="space-y-2">
      {label ? <div className="text-xs text-muted-foreground">{label}</div> : null}

      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-muted">
          {image.url ? (
            <Image src={image.url} alt="" fill className="object-cover" sizes="64px" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
              None
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className={adminButtonClasses("default", "md")}
          >
            Pick from library
          </button>

          <CloudinaryUploadButton
            folder={folder}
            accept="image/*"
            label="Upload"
            onUploaded={(u) => {
              setUploadError(null);
              onChange({ url: u.secureUrl, publicId: u.publicId });
            }}
            onError={setUploadError}
          />

          {image.url ? (
            <button
              type="button"
              onClick={() => onChange(EMPTY_SECTION_IMAGE)}
              className={adminButtonClasses("danger", "md")}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      {uploadError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {uploadError}
        </div>
      ) : null}

      {pickerOpen ? (
        <MediaPickerModal onPick={onChange} onClose={() => setPickerOpen(false)} />
      ) : null}
    </div>
  );
}
