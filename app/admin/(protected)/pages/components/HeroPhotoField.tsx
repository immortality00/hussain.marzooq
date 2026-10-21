"use client";

import { useState } from "react";
import { ImageField } from "@/components/admin/media-picker/ImageField";
import { AdminButton } from "@/components/admin/AdminButton";
import { CENTRE_FOCUS } from "@/lib/hero-focus";
import type { HeroPhoto } from "@/lib/hero-photos";
import { HeroFramingModal } from "./HeroFramingModal";

// One row of Home → Hero photos. Picking or uploading a photo opens the framing
// window straight away; Frame reopens it. A new photo starts centred.
export function HeroPhotoField({
  photo,
  count,
  onChange,
}: {
  photo: HeroPhoto;
  count: number;
  onChange: (photo: HeroPhoto) => void;
}) {
  const [framing, setFraming] = useState(false);

  return (
    <>
      <ImageField
        value={photo}
        clearable={false}
        onChange={(image) => {
          onChange({ url: image.url, publicId: image.publicId });
          setFraming(Boolean(image.url));
        }}
      />
      {photo.url ? (
        <AdminButton type="button" size="sm" onClick={() => setFraming(true)}>
          Frame
        </AdminButton>
      ) : null}
      {framing && photo.url ? (
        <HeroFramingModal
          url={photo.url}
          focus={photo.focus ?? CENTRE_FOCUS}
          count={count}
          onCancel={() => setFraming(false)}
          onDone={(focus) => {
            onChange({ ...photo, focus });
            setFraming(false);
          }}
        />
      ) : null}
    </>
  );
}
