import { ChevronDown, ChevronUp } from "lucide-react";
import type { PublicTestimonial } from "@/lib/server/testimonials";
import { Avatar } from "./Avatar";
import { ReviewPhotoStrip } from "./ReviewPhotoStrip";

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
}

function getIdentityLine(item: PublicTestimonial) {
  return [item.about, item.locationLabel || item.location].filter(Boolean).join(" • ");
}

export function SingleReviewCard({
  item,
  activeIndex,
  total,
  onOpen,
  onPrevious,
  onNext,
}: {
  item: PublicTestimonial;
  activeIndex: number;
  total: number;
  onOpen: (item: PublicTestimonial) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <article className="relative flex min-h-[285px] items-center rounded-2xl border border-border/60 bg-background p-4 shadow-sm sm:p-5 lg:min-h-[330px]">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={activeIndex === 0}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous review"
        >
          <ChevronUp className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={activeIndex === total - 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next review"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <button type="button" onClick={() => onOpen(item)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-5 pr-20">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={item.name} profilePhotoUrl={item.profilePhotoUrl} />

            <div className="min-w-0">
              <div className="truncate text-sm font-medium tracking-[-0.01em]">{item.name}</div>

              {getIdentityLine(item) ? (
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {getIdentityLine(item)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 text-xs tracking-[0.08em] text-amber-500">
            {renderStars(item.rating)}
          </div>
        </div>

        <blockquote
          key={item.id}
          className="mt-5 text-balance text-xl font-medium leading-[1.12] tracking-[-0.045em] sm:text-2xl lg:text-3xl"
        >
          &quot;{item.review}&quot;
        </blockquote>

        <ReviewPhotoStrip item={item} />

        <div className="mt-5 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span>Read review</span>
          <span>
            {activeIndex + 1} / {total}
          </span>
        </div>
      </button>
    </article>
  );
}
