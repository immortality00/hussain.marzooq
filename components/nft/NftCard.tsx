import Link from "next/link";
import SmartMediaPreview from "@/components/media/SmartMediaPreview";
import { buttonClasses } from "@/components/shared/Button";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import {
  buildInquiryHref,
  displayStatus,
  editionLabel,
  editionSubline,
  getPriceText,
  statusLabel,
} from "./lib";

function FrontBadge({ status }: { status: ReturnType<typeof displayStatus> }) {
  if (status === "sold") return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur-[6px]">
      {status === "available" ? (
        <span className="hm-nft-pulse relative inline-block h-1.5 w-1.5 rounded-full bg-white text-white" />
      ) : null}
      {statusLabel(status)}
    </span>
  );
}

export default function NftCard({
  item,
  onOpen,
  loadImageEagerly = false,
}: {
  item: PublicNftItem;
  onOpen: (item: PublicNftItem) => void;
  loadImageEagerly?: boolean;
}) {
  const priceText = getPriceText(item);
  const shownStatus = displayStatus(item);
  const inquiryHref = buildInquiryHref(item);
  const canBuy = Boolean(item.nft.marketplaceUrl) && shownStatus !== "sold";

  return (
    <article id={`nft-${item.id}`} data-cursor-expand className="hm-nft-card group h-[26rem]">
      <div
        role="button"
        tabIndex={0}
        aria-label={`View ${item.title}`}
        onClick={() => onOpen(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(item);
          }
        }}
        className="hm-nft-flip h-full w-full cursor-pointer rounded-[2.25rem] outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="hm-nft-face absolute inset-0 overflow-hidden rounded-[2.25rem] border bg-muted">
          <SmartMediaPreview
            mode={item.mediaUrl ? (item.mediaType === "video" ? "video" : "image") : "empty"}
            src={item.mediaUrl}
            title={item.title}
            fit={item.mediaType === "video" ? "contain" : "cover"}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            imagePriority={loadImageEagerly}
            imageClassName="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            emptyClassName="absolute inset-0 bg-muted"
          />

          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent" />

          <div className="absolute left-4 top-4">
            <FrontBadge status={shownStatus} />
          </div>

          {shownStatus === "sold" ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rotate-[-14deg] rounded-md border-2 border-white/85 px-6 py-2 font-mono text-3xl font-semibold uppercase tracking-[0.32em] text-white/90">
                Sold
              </span>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="text-2xl font-semibold tracking-tight text-white">{item.title}</div>
            <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
              {editionLabel(item)}
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-white/15 pt-3 text-sm">
              <span className="font-semibold text-white">{priceText}</span>
              <span className="text-white/70">{editionSubline(item)}</span>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="hm-nft-face hm-nft-face--back flex flex-col rounded-[2.25rem] border border-white/12 bg-neutral-950 p-6 text-white"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
                {editionLabel(item)}
              </div>
              <h3 className="mt-2 truncate text-xl font-semibold tracking-tight">{item.title}</h3>
            </div>
            <span className="shrink-0 rounded-full border border-white/25 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
              {statusLabel(shownStatus)}
            </span>
          </div>

          <dl className="mt-6 space-y-3.5 text-sm">
            <div className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-3.5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">Price</dt>
              <dd className="font-semibold">{priceText}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-3.5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">Edition</dt>
              <dd className="text-right text-white/85">{editionSubline(item)}</dd>
            </div>
          </dl>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
            {canBuy ? (
              <a
                href={item.nft.marketplaceUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                className={buttonClasses("solid", "w-full justify-center")}
              >
                Buy
              </a>
            ) : null}
            <Link
              href={inquiryHref}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className={buttonClasses("ghost", `w-full justify-center${canBuy ? "" : " col-span-2"}`)}
            >
              Inquire
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
