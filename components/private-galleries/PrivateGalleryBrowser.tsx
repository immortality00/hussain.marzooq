"use client";

import SmartImage from "@/components/shared/SmartImage";
import { useMemo, useState } from "react";
import { downloadCloudinaryFile } from "@/components/media/download";
import SmartMediaPreview from "@/components/media/SmartMediaPreview";
import type { MediaItem } from "@/components/media/types";
import { useModalNavbarLock } from "@/components/media/useModalNavbarLock";

const EAGER_GRID_IMAGE_COUNT = 3;

export default function PrivateGalleryBrowser({
  items,
  gallerySlug,
}: {
  items: MediaItem[];
  gallerySlug: string;
}) {
  const [active, setActive] = useState<MediaItem | null>(null);

  useModalNavbarLock(Boolean(active));

  const downloadableItems = useMemo(() => items.filter((item) => !!item.secureUrl), [items]);

  function downloadGallery() {
    window.location.href = `/api/private-galleries/download/${encodeURIComponent(gallerySlug)}`;
  }

  return (
    <div className="mt-10 space-y-6">
      {downloadableItems.length > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={downloadGallery}
            className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            Download gallery
          </button>
        </div>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => {
          const secureUrl = item.secureUrl;
          const isPriorityImage = index < EAGER_GRID_IMAGE_COUNT;

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-[2rem] border bg-background/60"
            >
              <button
                type="button"
                onClick={() => setActive(item)}
                className="block w-full text-left"
              >
                <div className="relative h-80 overflow-hidden bg-muted">
                  <SmartMediaPreview
                    mode={secureUrl ? (item.type === "video" ? "video" : "image") : "empty"}
                    src={secureUrl}
                    title={item.title}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    imagePriority={isPriorityImage}
                    imageClassName="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/72 via-black/10 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="text-2xl font-semibold tracking-tight text-white">
                      {item.title}
                    </div>
                  </div>
                </div>
              </button>

              <div className="p-5">
                {item.description ? (
                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActive(item)}
                    className="flex-1 rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    View
                  </button>

                  {secureUrl ? (
                    <button
                      type="button"
                      onClick={() => downloadCloudinaryFile(secureUrl)}
                      className="flex-1 rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
                    >
                      Download
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {active ? (
        <div
          className="fixed inset-0 z-50 bg-black/72 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b p-4">
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">{active.title}</div>
                {active.description ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {active.description}
                  </div>
                ) : null}
              </div>

              <button
                className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                onClick={() => setActive(null)}
              >
                Close
              </button>
            </div>

            <div className="grid h-[82vh] min-h-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="min-h-0 bg-black/5 p-4">
                <div className="h-full w-full overflow-hidden rounded-[1.5rem] border bg-black">
                  {active.secureUrl ? (
                    active.type === "video" ? (
                      <video
                        className="h-full w-full object-contain"
                        controls
                        preload="metadata"
                        playsInline
                        src={active.secureUrl}
                      />
                    ) : (
                      <div className="relative h-full w-full">
                        <SmartImage
                          src={active.secureUrl}
                          alt={active.title}
                          fill
                          className="object-contain"
                          sizes="(min-width: 1024px) 58vw, 100vw"
                          priority
                        />
                      </div>
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/70">
                      No media
                    </div>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto p-5" data-lenis-prevent>
                  <div className="space-y-4">
                    {active.description ? (
                      <div className="rounded-2xl border bg-background/50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Description
                        </div>
                        <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {active.description}
                        </div>
                      </div>
                    ) : null}

                    {active.location ||
                    active.event ||
                    active.year ||
                    active.people.length ||
                    active.categories.length ? (
                      <div className="rounded-2xl border bg-background/50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Details
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          {active.location ? <div>Location: {active.location}</div> : null}
                          {active.event ? <div>Event: {active.event}</div> : null}
                          {active.year ? <div>Year: {active.year}</div> : null}
                          {active.people.length ? (
                            <div>People: {active.people.join(", ")}</div>
                          ) : null}
                          {active.categories.length ? (
                            <div>Categories: {active.categories.join(", ")}</div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="border-t bg-background p-4">
                  {active.secureUrl ? (
                    <button
                      type="button"
                      onClick={() => downloadCloudinaryFile(active.secureUrl as string)}
                      className="flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
                    >
                      Download
                    </button>
                  ) : (
                    <div className="rounded-xl border px-4 py-2 text-center text-sm text-muted-foreground">
                      Download unavailable for this item
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}