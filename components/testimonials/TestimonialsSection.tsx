"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { PublicTestimonial } from "@/lib/server/testimonials";

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function IdentityLine({
  about,
  location,
}: {
  about: string | null;
  location: string | null;
}) {
  const value = [about, location].filter(Boolean).join(" • ");
  return (
    <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
      {value || "Client"}
    </div>
  );
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
  const sizeClass = size === "modal" ? "h-20 w-20 text-xl" : "h-14 w-14 text-sm";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-muted/55 ring-1 ring-border/50 ${sizeClass}`}
    >
      {profilePhotoUrl ? (
        <Image
          src={profilePhotoUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={size === "modal" ? "80px" : "56px"}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium text-muted-foreground">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

function PhotoTile({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[0.95rem] bg-muted/45">
      {src ? <Image src={src} alt={alt} fill className="object-cover" sizes="160px" /> : null}
    </div>
  );
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
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const extraPhotos = Math.max(0, item.photoUrls.length - 2);
          const reviewNeedsMore = item.review.trim().length > 120;

          return (
            <article
              key={item.id}
              className="rounded-[1.45rem] bg-background/78 p-4 ring-1 ring-border/45 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <button
                type="button"
                onClick={() => setActive(item)}
                className="flex h-full w-full flex-col text-left"
              >
                <div className="text-[17px] leading-7 tracking-[-0.02em] text-foreground">
                  “{item.review}”
                </div>

                <div className="mt-2 min-h-[20px]">
                  {reviewNeedsMore ? (
                    <span className="text-sm text-muted-foreground underline underline-offset-4">
                      Show more
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Avatar name={item.name} profilePhotoUrl={item.profilePhotoUrl} />

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium tracking-[-0.01em]">{item.name}</div>
                    <IdentityLine about={item.about} location={item.location} />
                    <div className="mt-2 text-sm text-amber-400">{renderStars(item.rating)}</div>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <PhotoTile src={item.photoUrls[0]} alt={`${item.name} photo 1`} />
                  <PhotoTile src={item.photoUrls[1]} alt={`${item.name} photo 2`} />

                  {extraPhotos > 0 ? (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[0.95rem] bg-foreground text-[11px] font-medium uppercase tracking-[0.16em] text-background">
                      Show more
                    </div>
                  ) : null}
                </div>
              </button>
            </article>
          );
        })}
      </section>

      {active ? (
        <div className="fixed inset-0 z-50 bg-black/72 p-4" onClick={() => setActive(null)}>
          <div
            className="mx-auto mt-6 w-full max-w-6xl overflow-hidden rounded-[2rem] bg-background shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-end border-b border-border/50 p-5">
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <Avatar
                      name={active.name}
                      profilePhotoUrl={active.profilePhotoUrl}
                      size="modal"
                    />

                    <div className="min-w-0">
                      <div className="text-2xl font-semibold tracking-[-0.03em]">
                        {active.name}
                      </div>
                      <IdentityLine about={active.about} location={active.location} />
                      <div className="mt-3 text-2xl text-amber-400">
                        {renderStars(active.rating)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-background/85 p-5 ring-1 ring-border/45">
                    <div className="whitespace-pre-wrap text-base leading-8 text-foreground">
                      {active.review}
                    </div>
                  </div>
                </div>

                <div>
                  {active.photoUrls.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {active.photoUrls.map((url) => (
                        <div
                          key={url}
                          className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[1.1rem] bg-muted/50"
                        >
                          <Image
                            src={url}
                            alt={active.name}
                            fill
                            className="object-contain"
                            sizes="480px"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] bg-background/85 p-6 text-sm text-muted-foreground ring-1 ring-border/45">
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