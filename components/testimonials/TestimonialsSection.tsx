"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { PublicTestimonial } from "@/lib/server/testimonials";

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
}

export default function TestimonialsSection({
  items,
}: {
  items: PublicTestimonial[];
}) {
  const [active, setActive] = useState<PublicTestimonial | null>(null);

  useEffect(() => {
    if (active) window.dispatchEvent(new Event("hm_modal_open"));
    else window.dispatchEvent(new Event("hm_modal_close"));
  }, [active]);

  return (
    <>
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className={`overflow-hidden rounded-[2rem] border bg-background/60 p-6 text-left transition-transform hover:-translate-y-0.5 ${
              item.featured ? "md:col-span-2 xl:col-span-2 ring-1 ring-foreground/20" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-lg text-amber-400">{renderStars(item.rating)}</div>
              {item.featured ? (
                <span className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Featured
                </span>
              ) : null}
            </div>

            <div className="mt-4 line-clamp-4 text-base leading-7 text-foreground">
              “{item.review}”
            </div>

            <div className="mt-6 flex items-start gap-4">
              {item.photoUrls.length > 0 ? (
                <div className="grid w-36 shrink-0 grid-cols-2 gap-2">
                  {item.photoUrls.slice(0, item.featured ? 4 : 2).map((url) => (
                    <div
                      key={url}
                      className="relative aspect-[4/5] overflow-hidden rounded-xl border bg-muted"
                    >
                      <Image src={url} alt={item.name} fill className="object-contain" sizes="200px" />
                    </div>
                  ))}
                </div>
              ) : null}

              <div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {item.about || "Client"}
                </div>
              </div>
            </div>
          </button>
        ))}
      </section>

      {active ? (
        <div className="fixed inset-0 z-50 bg-black/72 p-4" onClick={() => setActive(null)}>
          <div
            className="mx-auto mt-6 w-full max-w-5xl overflow-hidden rounded-[2rem] border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b p-5">
              <div>
                <div className="text-xl font-semibold tracking-tight">{active.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{active.about || "Client"}</div>
              </div>

              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="text-2xl text-amber-400">{renderStars(active.rating)}</div>

                  <div className="rounded-[1.5rem] border p-5">
                    <div className="whitespace-pre-wrap text-base leading-8 text-foreground">
                      “{active.review}”
                    </div>
                  </div>
                </div>

                <div>
                  {active.photoUrls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {active.photoUrls.map((url) => (
                        <div
                          key={url}
                          className="relative aspect-[4/5] overflow-hidden rounded-xl border bg-muted"
                        >
                          <Image src={url} alt={active.name} fill className="object-contain" sizes="320px" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                      No photos attached to this review.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}