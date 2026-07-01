import type { PublicTestimonial } from "@/lib/server/testimonials";
import { Avatar } from "./Avatar";
import { SafeImage } from "./SafeImage";

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
}

function getIdentityLine(item: PublicTestimonial) {
  return [item.about, item.locationLabel || item.location].filter(Boolean).join(" • ");
}

export function ReviewModal({
  item,
  onClose,
}: {
  item: PublicTestimonial;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-5 w-full max-w-6xl overflow-hidden rounded-[2rem] bg-background text-foreground shadow-2xl ring-1 ring-border/80"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border/60 p-5">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={item.name} profilePhotoUrl={item.profilePhotoUrl} size="card" />

            <div className="min-w-0">
              <div className="truncate text-lg font-semibold tracking-[-0.03em]">{item.name}</div>

              {getIdentityLine(item) ? (
                <div className="mt-1 truncate text-sm text-muted-foreground">
                  {getIdentityLine(item)}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-7" data-lenis-prevent>
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="space-y-6">
              <div className="text-xl text-amber-500">{renderStars(item.rating)}</div>

              <blockquote className="rounded-[1.5rem] border border-border/60 bg-muted/25 p-5 text-xl leading-9 tracking-[-0.02em] sm:text-2xl sm:leading-10">
                "{item.review}"
              </blockquote>
            </div>

            <div>
              {item.photoUrls.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {item.photoUrls.map((url, index) => (
                    <div
                      key={url}
                      className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[1.2rem] bg-muted/40 ring-1 ring-border/60"
                    >
                      <SafeImage
                        src={url}
                        alt={`${item.name} review photo ${index + 1}`}
                        className="object-contain"
                        sizes="520px"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-border/60 bg-muted/25 p-6 text-sm text-muted-foreground">
                  No photos attached to this review.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
