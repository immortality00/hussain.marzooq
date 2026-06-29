"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicTestimonial } from "@/lib/server/testimonials";

type GeoPoint = {
  key: string;
  label: string;
  count: number;
  lat: number;
  lon: number;
};

function normalizeLocationKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getReviewPoint(item: PublicTestimonial): GeoPoint | null {
  if (typeof item.locationLat !== "number") return null;
  if (typeof item.locationLon !== "number") return null;
  if (!Number.isFinite(item.locationLat) || !Number.isFinite(item.locationLon)) return null;

  const label = item.locationLabel || item.location || "Mapped location";

  return {
    key: normalizeLocationKey(label),
    label,
    count: 1,
    lat: item.locationLat,
    lon: item.locationLon,
  };
}

function getMapEmbedUrl(point: GeoPoint) {
  const lat = point.lat;
  const lon = point.lon;
  const delta = 0.85;
  const marker = `&marker=${lat.toFixed(6)},${lon.toFixed(6)}`;

  const bbox = [lon - delta, lat - delta, lon + delta, lat + delta]
    .map((value) => value.toFixed(6))
    .join("%2C");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function getIdentityLine(item: PublicTestimonial) {
  return [item.about, item.locationLabel || item.location].filter(Boolean).join(" • ");
}

function SafeImage({
  src,
  alt,
  className,
  sizes = "240px",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return <Image src={src} alt={alt} fill unoptimized className={className} sizes={sizes} />;
}

function Avatar({
  name,
  profilePhotoUrl,
  size = "card",
}: {
  name: string;
  profilePhotoUrl: string | null;
  size?: "card" | "modal";
}) {
  const sizeClass = size === "modal" ? "h-16 w-16 text-lg" : "h-10 w-10 text-xs";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/70 ${sizeClass}`}
    >
      {profilePhotoUrl ? (
        <SafeImage src={profilePhotoUrl} alt={name} className="object-cover" sizes="96px" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium text-muted-foreground">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

function ReviewPhotoStrip({ item }: { item: PublicTestimonial }) {
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

function TestimonialMap({ activePoint }: { activePoint: GeoPoint | null }) {
  if (!activePoint) {
    return (
      <section className="overflow-hidden rounded-[1.25rem] border border-border/60 bg-muted/20 p-2 shadow-sm">
        <div className="flex h-[250px] items-center justify-center rounded-[1rem] border border-border/70 bg-background px-6 text-center text-sm text-muted-foreground sm:h-[290px]">
          No location
        </div>
      </section>
    );
  }

  const mapUrl = getMapEmbedUrl(activePoint);

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-border/60 bg-muted/20 p-2 shadow-sm">
      <div className="relative overflow-hidden rounded-[1rem] border border-border/70 bg-background">
        <iframe
          key={activePoint.key}
          title={`Map centered on ${activePoint.label}`}
          src={mapUrl}
          className="h-[250px] w-full translate-y-[-8px] scale-[1.05] border-0 grayscale-[0.08] sm:h-[290px]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background via-background/95 to-transparent" />

        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-border/60 backdrop-blur">
          {activePoint.label}
        </div>

        <div className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] text-muted-foreground shadow-sm ring-1 ring-border/60 backdrop-blur">
          © OpenStreetMap
        </div>
      </div>
    </section>
  );
}

function ReviewModal({
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
                “{item.review}”
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

function SingleReviewCard({
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
    <article className="relative flex min-h-[285px] items-center rounded-[1.25rem] border border-border/60 bg-background p-4 shadow-sm sm:p-5 lg:min-h-[330px]">
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
          “{item.review}”
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

export default function TestimonialsSection({ items }: { items: PublicTestimonial[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalItem, setModalItem] = useState<PublicTestimonial | null>(null);
  const scrollLockRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  const activeItem = items[activeIndex] ?? items[0];
  const activePoint = useMemo(() => (activeItem ? getReviewPoint(activeItem) : null), [activeItem]);

  useEffect(() => {
    if (modalItem) {
      window.dispatchEvent(new Event("hm_modal_open"));
    } else {
      window.dispatchEvent(new Event("hm_modal_close"));
    }
  }, [modalItem]);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      setActiveIndex(Math.max(0, Math.min(items.length - 1, nextIndex)));
    },
    [items.length],
  );

  const goNext = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  const goPrevious = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (Math.abs(event.deltaY) < 16) return;

    const movingDown = event.deltaY > 0;
    const movingUp = event.deltaY < 0;
    const canMoveDown = activeIndex < items.length - 1;
    const canMoveUp = activeIndex > 0;

    if ((movingDown && canMoveDown) || (movingUp && canMoveUp)) {
      event.preventDefault();
      event.stopPropagation();

      if (scrollLockRef.current) return;

      scrollLockRef.current = true;

      if (movingDown) {
        goNext();
      } else {
        goPrevious();
      }

      window.setTimeout(() => {
        scrollLockRef.current = false;
      }, 650);
    }
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const startY = touchStartYRef.current;
    const endY = event.changedTouches[0]?.clientY ?? null;

    touchStartYRef.current = null;

    if (startY === null || endY === null) return;

    const difference = startY - endY;

    if (Math.abs(difference) < 40) return;

    if (difference > 0) {
      goNext();
    } else {
      goPrevious();
    }
  }

  if (!activeItem) return null;

  return (
    <>
      <section className="grid gap-5 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] lg:items-start">
        <div className="lg:sticky lg:top-20">
          <TestimonialMap activePoint={activePoint} />
        </div>

        <div
          className="relative"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <SingleReviewCard
            item={activeItem}
            activeIndex={activeIndex}
            total={items.length}
            onOpen={setModalItem}
            onPrevious={goPrevious}
            onNext={goNext}
          />

          <div className="mt-4 flex justify-center gap-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex ? "w-8 bg-foreground" : "w-2 bg-muted-foreground/30"
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {modalItem ? <ReviewModal item={modalItem} onClose={() => setModalItem(null)} /> : null}
    </>
  );
}