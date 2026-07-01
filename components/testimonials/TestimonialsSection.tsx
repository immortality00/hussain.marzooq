"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicTestimonial } from "@/lib/server/testimonials";
import { type GeoPoint, TestimonialMap } from "./TestimonialMap";
import { SingleReviewCard } from "./SingleReviewCard";
import { ReviewModal } from "./ReviewModal";

function normalizeLocationKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
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

  const goNext = useCallback(() => goToIndex(activeIndex + 1), [activeIndex, goToIndex]);
  const goPrevious = useCallback(() => goToIndex(activeIndex - 1), [activeIndex, goToIndex]);

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

      if (movingDown) goNext();
      else goPrevious();

      window.setTimeout(() => { scrollLockRef.current = false; }, 650);
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

    if (difference > 0) goNext();
    else goPrevious();
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
