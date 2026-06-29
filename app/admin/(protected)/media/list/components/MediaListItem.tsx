import Image from "next/image";
import { useRouter } from "next/navigation";

type NftData = {
  price: number | null;
  currency: "ETH" | "SOL" | "XTZ" | "BTC";
  editionType: "1/1" | "limited" | "open";
  editionsTotal: number | null;
  editionsRemaining: number | null;
  openUntil: string | null;
  status: "available" | "sold" | "coming-soon";
  marketplaceUrl: string | null;
};

export type MediaItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories: string[];
  people: string[];
  nft: NftData | null;
  isPublic: boolean;
  secureUrl: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};

function statusClasses(status: "available" | "sold" | "coming-soon") {
  if (status === "sold") return "border-rose-500/30 bg-rose-500/12 text-rose-700 dark:text-rose-300";
  if (status === "coming-soon") return "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300";
  return "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300";
}

function formatNftQuantity(nft: NftData) {
  if (nft.editionType === "open") {
    return nft.openUntil ? `Open until ${nft.openUntil.replace("T", " ")}` : "Open edition";
  }
  return `${nft.editionsRemaining ?? "—"}/${nft.editionsTotal ?? "—"} remaining`;
}

export function MediaListItem({
  item,
  index,
  deleting,
  actionDisabled,
  onDelete,
}: {
  item: MediaItem;
  index: number;
  deleting: boolean;
  actionDisabled: boolean;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border p-5">
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className="overflow-hidden rounded-2xl border bg-muted">
          {item.secureUrl ? (
            item.type === "video" ? (
              <video className="h-full w-full" controls preload="metadata" src={item.secureUrl} />
            ) : (
              <div className="relative aspect-4/3">
                <Image
                  src={item.secureUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="240px"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            )
          ) : (
            <div className="flex h-45 items-center justify-center text-xs text-muted-foreground">
              No preview
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-lg font-semibold">{item.title}</div>
                {deleting ? (
                  <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                    Processing
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {item.type} • {item.isPublic ? "Public" : "Private"}
                {item.year ? ` • ${item.year}` : ""}
                {item.location ? ` • ${item.location}` : ""}
                {item.event ? ` • ${item.event}` : ""}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={actionDisabled}
                onClick={() => router.push(`/admin/media?edit=${encodeURIComponent(item.id)}`)}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={actionDisabled}
                onClick={() => onDelete(item.id)}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {item.categories.slice(0, 10).map((c) => (
              <span key={`${item.id}-${c}`} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {c}
              </span>
            ))}
            {item.nft ? (
              <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClasses(item.nft.status)}`}>
                {item.nft.status}
              </span>
            ) : null}
          </div>

          {item.nft ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border px-2 py-0.5">{item.nft.editionType}</span>
              <span className="rounded-full border px-2 py-0.5">{formatNftQuantity(item.nft)}</span>
              {item.nft.price !== null ? (
                <span className="rounded-full border px-2 py-0.5">
                  {item.nft.price} {item.nft.currency}
                </span>
              ) : null}
            </div>
          ) : null}

          {item.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.slice(0, 14).map((t) => (
                <span key={`${item.id}-${t}`} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-3 font-mono text-xs text-muted-foreground">ID: {item.id}</div>
        </div>
      </div>
    </div>
  );
}
