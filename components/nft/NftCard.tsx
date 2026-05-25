import Image from "next/image";
import Link from "next/link";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import {
  buildInquiryHref,
  displayStatus,
  editionLabel,
  editionSubline,
  getPriceText,
  statusClasses,
} from "./lib";

export default function NftCard({
  item,
  onOpen,
  imagePriority = false,
}: {
  item: PublicNftItem;
  onOpen: (item: PublicNftItem) => void;
  imagePriority?: boolean;
}) {
  const priceText = getPriceText(item);
  const shownStatus = displayStatus(item);
  const inquiryHref = buildInquiryHref(item);

  return (
    <article
      id={`nft-${item.id}`}
      className="overflow-hidden rounded-[2rem] border bg-background/60"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(item);
          }
        }}
        className="group cursor-pointer"
      >
        <div className="relative h-80 overflow-hidden bg-muted">
          {item.mediaUrl ? (
            item.mediaType === "video" ? (
              <video
                className="h-full w-full object-contain bg-black"
                preload="metadata"
                src={item.mediaUrl}
              />
            ) : (
              <Image
                src={item.mediaUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                loading={imagePriority ? "eager" : "lazy"}
                fetchPriority={imagePriority ? "high" : undefined}
              />
            )
          ) : (
            <div className="h-full w-full bg-linear-to-br from-muted to-background" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/78 via-black/12 to-transparent" />

          {shownStatus === "sold" ? (
            <div className="pointer-events-none absolute -left-18 top-8 w-72 rotate-[-35deg] bg-rose-600 py-3 text-center text-base font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
              Sold
            </div>
          ) : (
            <div
              className={`absolute left-4 top-4 inline-flex rounded-full px-3 py-1 text-xs ${statusClasses(
                shownStatus
              )}`}
            >
              {shownStatus}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="text-2xl font-semibold tracking-tight text-white">{item.title}</div>
          </div>
        </div>
      </div>

      <div className="p-5">
        {item.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Price
            </div>
            <div className="mt-2 text-base font-semibold">{priceText}</div>
          </div>

          <div className="text-right">
            <div className="mt-2 text-base font-semibold">{editionLabel(item)}</div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">
              {editionSubline(item)}
            </div>
          </div>
        </div>

        <div className="mt-5">
          {item.nft.marketplaceUrl && shownStatus !== "sold" ? (
            <a
              href={item.nft.marketplaceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
            >
              Buy
            </a>
          ) : (
            <Link
              href={inquiryHref}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
            >
              Inquire
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}