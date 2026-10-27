import type { AdminMediaListItem } from "@/lib/server/media-serializers";

type NftData = NonNullable<AdminMediaListItem["nft"]>;

function statusClasses(status: NftData["status"]) {
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

export function NftStatusChip({ nft }: { nft: NftData }) {
  return <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClasses(nft.status)}`}>{nft.status}</span>;
}

export function NftDetails({ nft }: { nft: NftData }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
      <span className="rounded-full border px-2 py-0.5">{nft.editionType}</span>
      <span className="rounded-full border px-2 py-0.5">{formatNftQuantity(nft)}</span>
      {nft.price !== null ? (
        <span className="rounded-full border px-2 py-0.5">
          {nft.price} {nft.currency}
        </span>
      ) : null}
    </div>
  );
}
