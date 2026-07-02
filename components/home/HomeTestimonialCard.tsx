"use client";

import { useState } from "react";
import type { PublicTestimonial } from "@/lib/server/testimonials";
import { SingleReviewCard } from "@/components/testimonials/SingleReviewCard";
import { ReviewModal } from "@/components/testimonials/ReviewModal";
import { useModalNavbarLock } from "@/components/media/useModalNavbarLock";

export function HomeTestimonialCard({ items }: { items: PublicTestimonial[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalItem, setModalItem] = useState<PublicTestimonial | null>(null);

  useModalNavbarLock(modalItem !== null);

  const activeItem = items[activeIndex] ?? items[0];
  if (!activeItem) return null;

  return (
    <>
      <SingleReviewCard
        item={activeItem}
        activeIndex={activeIndex}
        total={items.length}
        onOpen={setModalItem}
        onPrevious={() => setActiveIndex((i) => Math.max(0, i - 1))}
        onNext={() => setActiveIndex((i) => Math.min(items.length - 1, i + 1))}
      />

      {modalItem ? <ReviewModal item={modalItem} onClose={() => setModalItem(null)} /> : null}
    </>
  );
}
