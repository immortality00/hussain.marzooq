import type { PublicNftItem } from "@/lib/server/public-nfts";

export const currencySymbol: Record<PublicNftItem["nft"]["currency"], string> = {
  ETH: "Ξ",
  SOL: "◎",
  XTZ: "ꜩ",
  BTC: "₿",
};

export function formatStableDateTime(value: string | null) {
  if (!value) return null;

  const raw = value.trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hours, minutes] = match;
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;

  const year = String(d.getFullYear());
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export function hasOpenEditionEndedByDate(item: PublicNftItem) {
  if (item.nft.editionType !== "open" || !item.nft.openUntil) return false;
  const end = new Date(item.nft.openUntil).getTime();
  return !Number.isNaN(end) && end <= Date.now();
}

export function displayStatus(item: PublicNftItem) {
  if (item.nft.status === "sold") return "sold";
  return item.nft.status;
}

export function statusClasses(status: ReturnType<typeof displayStatus>) {
  if (status === "sold") {
    return "bg-rose-600 text-white shadow-[0_8px_24px_rgba(0,0,0,0.32)]";
  }
  if (status === "coming-soon") {
    return "border border-black/40 bg-black/84 text-amber-200 shadow-[0_8px_24px_rgba(0,0,0,0.32)]";
  }
  return "border border-black/40 bg-black/84 text-emerald-200 shadow-[0_8px_24px_rgba(0,0,0,0.32)]";
}

export function editionLabel(item: PublicNftItem) {
  if (item.nft.editionType === "1/1") return "Unique edition";
  if (item.nft.editionType === "limited") return "Limited edition";
  return "Open edition";
}

export function editionSubline(item: PublicNftItem) {
  if (item.nft.editionType === "1/1") return "1/1 left";

  if (item.nft.editionType === "limited") {
    const remaining = item.nft.editionsRemaining ?? 0;
    const total = item.nft.editionsTotal ?? 0;
    return `${remaining}/${total} left`;
  }

  if (item.nft.status === "sold") {
    return "Unavailable, open edition ended";
  }

  if (hasOpenEditionEndedByDate(item)) {
    return "Unavailable, open edition ended";
  }

  const formatted = formatStableDateTime(item.nft.openUntil);
  if (formatted) {
    return `Available until ${formatted}`;
  }

  return "Unavailable, open edition ended";
}

export function buildInquiryContext(item: PublicNftItem) {
  const priceText =
    item.nft.price !== null
      ? `${item.nft.price} ${currencySymbol[item.nft.currency]} (${item.nft.currency})`
      : "Price on request";

  const editionText =
    item.nft.editionType === "open"
      ? editionSubline(item)
      : item.nft.editionType === "1/1"
        ? "Unique edition • 1/1 left"
        : `Limited edition • ${item.nft.editionsRemaining}/${item.nft.editionsTotal} left`;

  return [
    "NFT inquiry",
    `Item: ${item.title}`,
    `Price: ${priceText}`,
    `Edition: ${editionText}`,
    `Status: ${displayStatus(item)}`,
    `Reference: /nft#nft-${item.id}`,
  ].join("\n");
}

export function buildInquiryHref(item: PublicNftItem) {
  return `/contact?service=${encodeURIComponent("NFT Inquiry")}&category=${encodeURIComponent(
    "nft"
  )}&context=${encodeURIComponent(buildInquiryContext(item))}`;
}

export function getPriceText(item: PublicNftItem) {
  return item.nft.price !== null
    ? `${item.nft.price} ${currencySymbol[item.nft.currency]}`
    : "Price on request";
}