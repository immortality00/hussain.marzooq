"use client";

import { CldUploadWidget } from "next-cloudinary";
import { PreviewImage } from "./PreviewImage";
import type { WidgetResult } from "./types";
import { getString, isRecord } from "./utils";

export function ReviewPhotosField({
  folder,
  photoUrls,
  onUploaded,
  onClear,
  onRemove,
}: {
  folder: string;
  photoUrls: string[];
  onUploaded: (url: string) => void;
  onClear: () => void;
  onRemove: (url: string) => void;
}) {
  return (
    <div className="rounded-[2rem] border border-border/60 bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-medium">Photos</label>

        <div className="flex flex-wrap gap-2">
          {folder ? (
            <CldUploadWidget
              signatureEndpoint="/api/testimonials/upload-signature"
              options={{
                folder,
                multiple: true,
                maxFiles: 12,
                resourceType: "image",
                clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif", "heic", "heif"],
                maxFileSize: 10_485_760,
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
                  Upload photos
                </button>
              )}
            </CldUploadWidget>
          ) : (
            <button
              type="button"
              disabled
              className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm opacity-60"
            >
              Upload photos
            </button>
          )}

          {photoUrls.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {photoUrls.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photoUrls.map((url) => (
            <div key={url} className="space-y-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-background ring-1 ring-border/60">
                <PreviewImage src={url} alt="Review upload" className="object-cover" />
              </div>

              <button
                type="button"
                onClick={() => onRemove(url)}
                className="w-full rounded-xl border border-border/70 bg-background px-3 py-1.5 text-xs hover:bg-muted"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-background p-5 text-sm text-muted-foreground">
          Add optional photos from the work or the experience.
        </div>
      )}
    </div>
  );
}
