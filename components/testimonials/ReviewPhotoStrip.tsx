import type { PublicTestimonial } from "@/lib/server/testimonials";
import { SafeImage } from "./SafeImage";

export function ReviewPhotoStrip({ item }: { item: PublicTestimonial }) {
  const visiblePhotos = item.photoUrls.slice(0, 3);
  const hiddenPhotosCount = Math.max(0, item.photoUrls.length - visiblePhotos.length);

  if (visiblePhotos.length === 0) return null;

  return (
    <div className="mt-4 flex items-end gap-2 overflow-hidden">
      {visiblePhotos.map((url, index) => (
        <div
          key={url}
          className={`relative overflow-hidden rounded-[0.85rem] bg-muted ring-1 ring-border/60 ${
            index === 0 ? "h-16 w-14" : "h-12 w-12"
          }`}
        >
          <SafeImage
            src={url}
            alt={`${item.name} review photo ${index + 1}`}
            className="object-cover"
            sizes="100px"
          />
        </div>
      ))}

      {hiddenPhotosCount > 0 ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-[0.85rem] bg-foreground text-xs font-semibold text-background">
          +{hiddenPhotosCount}
        </div>
      ) : null}
    </div>
  );
}
