import { asNullableString, asNumberOrNull, asStringArray, isRecord } from "@/app/api/_lib/common";
import { sanitizeAppearances, type Appearance, type NftMeta } from "@/app/api/_lib/media";
import { mediaAssetPath } from "@/lib/media-asset-path";

export type PublicMediaItem = {
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
  appearances: Appearance[];
  secureUrl: string | null;
  publicId: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};

export type AdminMediaListItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  secureUrl: string | null;
  embedUrl: string | null;
  categories: string[];
  tags: string[];
  location: string | null;
  peopleIds: string[];
  people: string[];
  event: string | null;
  year: number | null;
  nft: NftMeta | null;
  isPublic: boolean;
  createdAt: string | null;
};

export function buildPublicMediaQuery({
  type,
  category,
}: {
  type?: "all" | "image" | "video" | "embed" | string | null;
  category?: string | null;
}) {
  const query: Record<string, unknown> = {
    $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
  };

  if (type && type !== "all") {
    query.type = type;
  }

  if (category?.trim()) {
    query.categories = category.trim();
  }

  return query;
}

function getAssetRecord(doc: Record<string, unknown>) {
  return isRecord(doc.asset) ? doc.asset : {};
}

function serializeDate(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (!value) return null;

  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getNftMeta(doc: Record<string, unknown>): NftMeta | null {
  const nft = isRecord(doc.nft) ? doc.nft : null;
  if (!nft) return null;

  const currency = asNullableString(nft.currency);
  const editionType = asNullableString(nft.editionType);
  const status = asNullableString(nft.status);

  if (
    !(currency === "ETH" || currency === "SOL" || currency === "XTZ" || currency === "BTC") ||
    !(editionType === "1/1" || editionType === "limited" || editionType === "open") ||
    !(status === "available" || status === "sold" || status === "coming-soon")
  ) {
    return null;
  }

  return {
    price: asNumberOrNull(nft.price),
    currency,
    editionType,
    editionsTotal: asNumberOrNull(nft.editionsTotal),
    editionsRemaining: asNumberOrNull(nft.editionsRemaining),
    openUntil: asNullableString(nft.openUntil),
    status,
    marketplaceUrl: asNullableString(nft.marketplaceUrl),
  };
}

export function toPublicMediaItem(doc: Record<string, unknown>): PublicMediaItem {
  const asset = getAssetRecord(doc);

  const secureUrl =
    asNullableString(doc.secureUrl) ??
    asNullableString(asset.secureUrl) ??
    asNullableString((asset as Record<string, unknown>).secure_url);

  const publicId = asNullableString(doc.publicId) ?? asNullableString(asset.publicId);
  const embedUrl = asNullableString(doc.embedUrl) ?? asNullableString(asset.embedUrl);

  return {
    id: String(doc._id),
    type: asNullableString(doc.type) ?? "image",
    title: asNullableString(doc.title) ?? "",
    description: asNullableString(doc.description),
    location: asNullableString(doc.location),
    event: asNullableString(doc.event),
    year: typeof doc.year === "number" ? doc.year : null,
    tags: asStringArray(doc.tags),
    categories: asStringArray(doc.categories),
    people: asStringArray(doc.people),
    appearances: sanitizeAppearances(doc.appearances),
    secureUrl: secureUrl ?? null,
    publicId: publicId ?? null,
    embedUrl: embedUrl ?? null,
    createdAt: serializeDate(doc.createdAt),
  };
}

export function toAdminMediaListItem(doc: Record<string, unknown>): AdminMediaListItem {
  const asset = getAssetRecord(doc);
  const storedUrl =
    asNullableString(doc.secureUrl) ??
    asNullableString(asset.secureUrl) ??
    asNullableString((asset as Record<string, unknown>).secure_url);
  const secureUrl =
    doc.deliveryType === "authenticated" ? mediaAssetPath(String(doc._id)) : storedUrl;
  const embedUrl = asNullableString(doc.embedUrl) ?? asNullableString(asset.embedUrl);

  return {
    id: String(doc._id),
    type: asNullableString(doc.type) ?? "image",
    title: asNullableString(doc.title) ?? "",
    description: asNullableString(doc.description),
    secureUrl: secureUrl ?? null,
    embedUrl: embedUrl ?? null,
    categories: asStringArray(doc.categories),
    tags: asStringArray(doc.tags),
    location: asNullableString(doc.location),
    peopleIds: asStringArray(doc.peopleIds),
    people: asStringArray(doc.people),
    event: asNullableString(doc.event),
    year: typeof doc.year === "number" ? doc.year : null,
    nft: getNftMeta(doc),
    isPublic: doc.isPublic !== false,
    createdAt: serializeDate(doc.createdAt),
  };
}