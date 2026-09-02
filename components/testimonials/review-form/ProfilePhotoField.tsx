"use client";

import { CldUploadWidget } from "next-cloudinary";
import { PreviewImage } from "./PreviewImage";
import type { WidgetResult } from "./types";
import { getString, isRecord } from "./utils";

export function ProfilePhotoField({
  folder,
  profilePhotoUrl,
  onUploaded,
}: {
  folder: string;
  profilePhotoUrl: string;
  onUploaded: (url: string) => void;
}) {
  return (
    <div className="shrink-0">
      <div className="text-sm font-medium">Profile photo</div>

      <div className="mt-3">
        {folder ? (
          <CldUploadWidget
            signatureEndpoint="/api/testimonials/upload-signature"
            options={{
              folder,
              multiple: false,
              resourceType: "image",
              clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif", "heic", "heif"],
              maxFileSize: 10_485_760,
              cropping: true,
              croppingAspectRatio: 1,
              showSkipCropButton: false,
            }}
            onSuccess={(result: unknown) => {
              const info = (result as WidgetResult)?.info;
              if (!isRecord(info)) return;

              const secureUrl = getString(info.secure_url);
              if (secureUrl) onUploaded(secureUrl);
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                Upload
              </button>
            )}
          </CldUploadWidget>
        ) : (
          <button
            type="button"
            disabled
            className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm opacity-60"
          >
            Upload
          </button>
        )}
      </div>

      <div className="relative mt-4 h-24 w-24 overflow-hidden rounded-full bg-background ring-1 ring-border/70">
        {profilePhotoUrl ? (
          <PreviewImage src={profilePhotoUrl} alt="Profile photo" className="object-cover" />
        ) : null}
      </div>
    </div>
  );
}
