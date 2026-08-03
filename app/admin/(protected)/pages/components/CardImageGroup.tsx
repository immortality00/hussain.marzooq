"use client";

import { Image as ImageIcon } from "lucide-react";
import type { SectionImage } from "@/lib/page-sections-shared";
import { ImageField } from "@/components/admin/media-picker/ImageField";
import { GroupCard } from "./GroupCard";
import { CardImageWarning } from "./CardImageWarning";

// The image shown on this discipline's card in the Work overlay ("work layout").
// Empty means no image — there is no auto-pick fallback.
export function CardImageGroup({
  value,
  onChange,
  isActive,
}: {
  value: SectionImage;
  onChange: (image: SectionImage) => void;
  isActive: boolean;
}) {
  return (
    <GroupCard icon={ImageIcon} label="Work layout image" tint="image">
      <p className="text-xs text-muted-foreground">
        Shown on this page&apos;s card in the Work overlay. Leave empty for no image.
      </p>
      {isActive && !value.url && (
        <CardImageWarning message="This page is visible but has no image — its card renders blank in the Work overlay." />
      )}
      <ImageField value={value} onChange={onChange} />
    </GroupCard>
  );
}
