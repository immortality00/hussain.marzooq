"use client";

import { CloudinaryMultiUploadButton } from "@/components/shared/upload/CloudinaryMultiUploadButton";
import { PreviewImage } from "./PreviewImage";
import { MAX_REVIEW_PHOTOS, REVIEW_UPLOAD_TARGET, UPLOAD_BUTTON_CLASS } from "./utils";

export function ReviewPhotosField({
  folder,
  photoUrls,
  onUploaded,
  onClear,
  onRemove,
  onError,
}: {
  folder: string;
  photoUrls: string[];
  onUploaded: (url: string) => void;
  onClear: () => void;
  onRemove: (url: string) => void;
  onError: (message: string) => void;
}) {
  return (
    <div className="rounded-[2rem] border border-border/60 bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium">Photos</div>

        <div className="flex flex-wrap gap-2">
          <CloudinaryMultiUploadButton
            folder={folder}
            target={REVIEW_UPLOAD_TARGET}
            accept="image/*"
            label="Upload photos"
            maxFiles={MAX_REVIEW_PHOTOS - photoUrls.length}
            disabled={!folder || photoUrls.length >= MAX_REVIEW_PHOTOS}
            className={UPLOAD_BUTTON_CLASS}
            onUploaded={(files) => files.forEach((file) => onUploaded(file.secureUrl))}
            onError={onError}
          />

          {photoUrls.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className={UPLOAD_BUTTON_CLASS}
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
