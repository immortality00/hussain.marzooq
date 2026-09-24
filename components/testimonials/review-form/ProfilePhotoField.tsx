"use client";

import { AvatarUploadField } from "@/components/shared/upload/AvatarUploadField";
import { PreviewImage } from "./PreviewImage";
import { REVIEW_UPLOAD_TARGET, UPLOAD_BUTTON_CLASS } from "./utils";

export function ProfilePhotoField({
  folder,
  profilePhotoUrl,
  onUploaded,
  onError,
}: {
  folder: string;
  profilePhotoUrl: string;
  onUploaded: (url: string) => void;
  onError: (message: string) => void;
}) {
  return (
    <div className="shrink-0">
      <div className="text-sm font-medium">Profile photo</div>

      <div className="mt-3">
        <AvatarUploadField
          folder={folder}
          target={REVIEW_UPLOAD_TARGET}
          label="Upload"
          disabled={!folder}
          className={UPLOAD_BUTTON_CLASS}
          onUploaded={(uploaded) => onUploaded(uploaded.secureUrl)}
          onError={onError}
        />
      </div>

      <div className="relative mt-4 h-24 w-24 overflow-hidden rounded-full bg-background ring-1 ring-border/70">
        {profilePhotoUrl ? (
          <PreviewImage src={profilePhotoUrl} alt="Profile photo" className="object-cover" />
        ) : null}
      </div>
    </div>
  );
}
