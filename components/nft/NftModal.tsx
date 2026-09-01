import SmartImage from "@/components/shared/SmartImage";
import Link from "next/link";
import { ModalPortal } from "@/components/shared/ModalPortal";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import { formatDates } from "@/components/media/utils";
import {
  buildInquiryHref,
  displayStatus,
  editionLabel,
  editionSubline,
  getPriceText,
  statusClasses,
  statusLabel,
} from "./lib";

export default function NftModal({
  item,
  onClose,
}: {
  item: PublicNftItem;
  onClose: () => void;
}) {
  const priceText = getPriceText(item);
  const inquiryHref = buildInquiryHref(item);
  const shownStatus = displayStatus(item);

  return (
    <ModalPortal onClose={onClose} className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/70 p-4">
      <div
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{item.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{editionLabel(item)}</div>
          </div>

          <button
            className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid h-[82vh] min-h-0 grid-rows-[45vh_minmax(0,1fr)] lg:grid-rows-none lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-h-0 bg-black/5 p-4">
            <div className="h-full w-full overflow-hidden rounded-[2rem] border bg-black">
              {item.mediaUrl ? (
                item.mediaType === "video" ? (
                  <video
                    className="h-full w-full object-contain"
                    controls
                    preload="metadata"
                    playsInline
                    src={item.mediaUrl}
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <SmartImage
                      src={item.mediaUrl}
                      alt={item.title}
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

          <div className="min-h-0 overflow-hidden">
            <div className="flex h-full min-h-0 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-5" data-lenis-prevent>
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs ${statusClasses(shownStatus)}`}>
                      {statusLabel(shownStatus)}
                    </span>
                    <span className="inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground">
                      {item.nft.currency}
                    </span>
                    {item.year ? (
                      <span className="inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        {item.year}
                      </span>
                    ) : null}
                  </div>

                  {item.description ? (
                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Description
                      </div>
                      <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Price
                      </div>
                      <div className="mt-3 text-lg font-semibold">{priceText}</div>
                    </div>

                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Edition
                      </div>
                      <div className="mt-3 text-lg font-semibold">{editionLabel(item)}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{editionSubline(item)}</div>
                    </div>
                  </div>

                  {item.location || item.event || item.year || item.people.length || item.categories.length ? (
                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Media details
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {item.location ? <div>Location: {item.location}</div> : null}
                        {item.event ? <div>Event: {item.event}</div> : null}
                        {item.year ? <div>Year: {item.year}</div> : null}
                        {item.people.length ? <div>People: {item.people.join(", ")}</div> : null}
                        {item.categories.length ? <div>Categories: {item.categories.join(", ")}</div> : null}
                      </div>
                    </div>
                  ) : null}

                  {item.tags.length ? (
                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Tags
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={`${item.id}-${tag}`}
                            className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {item.appearances.length ? (
                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Appearances
                      </div>
                      <div className="mt-3 space-y-3">
                        {item.appearances.map((appearance, index) => (
                          <div
                            key={`${item.id}-appearance-${index}`}
                            className="rounded-xl border px-3 py-3 text-sm text-muted-foreground"
                          >
                            <div className="font-medium text-foreground">
                              {appearance.title || appearance.venue}
                            </div>
                            <div className="mt-1">
                              {[appearance.venue, appearance.city, appearance.country]
                                .filter(Boolean)
                                .join(" • ")}
                            </div>
                            <div className="mt-1">{formatDates(appearance)}</div>
                            {appearance.notes ? (
                              <div className="mt-2 whitespace-pre-wrap">{appearance.notes}</div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="border-t bg-background p-4">
                {item.nft.marketplaceUrl && shownStatus !== "sold" ? (
                  <a
                    href={item.nft.marketplaceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
                  >
                    Buy
                  </a>
                ) : (
                  <Link
                    href={inquiryHref}
                    className="flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
                  >
                    Inquire
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}