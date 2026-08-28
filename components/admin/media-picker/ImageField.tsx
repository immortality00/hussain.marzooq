"use client";

import Image from "next/image";
import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { CLOUDINARY_SECTIONS_FOLDER } from "@/lib/cloudinary-folders";
import { EMPTY_SECTION_IMAGE } from "@/lib/page-sections-shared";
import type { SectionImage } from "@/lib/page-sections-shared";
import { MediaPickerModal } from "./MediaPickerModal";
import { adminButtonClasses } from "@/components/admin/AdminButton";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

// Reusable admin image control: pick an existing library image OR upload a new
// one to Cloudinary, plus remove. Uploaded images carry a publicId (cleaned up
// on replace by the save routes); picked images do not.
export function ImageField({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: SectionImage | undefined;
  onChange: (image: SectionImage) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
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

          <CldUploadWidget
            signatureEndpoint="/api/sign-cloudinary-params"
            options={{ folder: CLOUDINARY_SECTIONS_FOLDER, multiple: false, resourceType: "image" }}
            onSuccess={(result: unknown) => {
              const info = isRecord(result) ? result.info : null;
              if (!isRecord(info)) return;
              const url = getString(info.secure_url);
              const publicId = getString(info.public_id);
              if (url) onChange({ url, publicId });
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className={adminButtonClasses("default", "md")}
              >
                Upload
              </button>
            )}
          </CldUploadWidget>

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

      {pickerOpen ? (
        <MediaPickerModal onPick={onChange} onClose={() => setPickerOpen(false)} />
      ) : null}
    </div>
  );
}
