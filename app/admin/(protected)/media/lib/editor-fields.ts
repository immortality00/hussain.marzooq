import { toVideoWatchUrl } from "@/lib/video-embed";
import type {
  Appearance,
  CryptoCurrency,
  MediaCategory,
  MediaItem,
  NftEditionType,
  NftStatus,
  SavedPoster,
  Uploaded,
} from "./types";

export type BaseFields = {
  editingId: string;
  mode: "upload" | "embed";
  uploaded: Uploaded | null;
  embedUrl: string;
  savedPoster: SavedPoster | null;
  title: string;
  description: string;
  location: string;
  locationId: string | null;
  locationLat: number | null;
  locationLon: number | null;
  locationCountryCode: string | null;
  event: string;
  year: string;
  tagSlugs: string[];
  peopleIds: string[];
  peopleNames: string[];
  categories: MediaCategory[];
  isPublic: boolean;
  privateGalleryTitles: string[];
};

export type NftFields = {
  price: string;
  currency: CryptoCurrency;
  editionType: NftEditionType;
  editionsTotal: string;
  editionsRemaining: string;
  openUntil: string;
  status: NftStatus;
  marketplaceUrl: string;
};

function uploadedFrom(m: MediaItem): Uploaded | null {
  if (m.type === "embed" || !m.secureUrl || !m.publicId || !m.resourceType) return null;
  return { secureUrl: m.secureUrl, publicId: m.publicId, resourceType: m.resourceType };
}

export function baseFieldsFrom(m: MediaItem | null): BaseFields {
  if (!m) {
    return {
      editingId: "",
      mode: "upload",
      uploaded: null,
      embedUrl: "",
      savedPoster: null,
      title: "",
      description: "",
      location: "",
      locationId: null,
      locationLat: null,
      locationLon: null,
      locationCountryCode: null,
      event: "",
      year: "",
      tagSlugs: [],
      peopleIds: [],
      peopleNames: [],
      categories: [],
      isPublic: true,
      privateGalleryTitles: [],
    };
  }

  const embed = m.type === "embed";
  return {
    editingId: m.id,
    mode: embed ? "embed" : "upload",
    uploaded: uploadedFrom(m),
    embedUrl: embed ? toVideoWatchUrl(m.embedUrl ?? "") : "",
    savedPoster: embed && m.embedUrl && m.posterUrl ? { url: m.posterUrl, embedUrl: m.embedUrl } : null,
    title: m.title ?? "",
    description: m.description ?? "",
    location: m.location ?? "",
    locationId: m.locationId ?? null,
    locationLat: typeof m.locationLat === "number" ? m.locationLat : null,
    locationLon: typeof m.locationLon === "number" ? m.locationLon : null,
    locationCountryCode: m.locationCountryCode ?? null,
    event: m.event ?? "",
    year: m.year ? String(m.year) : "",
    tagSlugs: m.tags ?? [],
    peopleIds: m.peopleIds ?? [],
    peopleNames: m.people ?? [],
    categories: (m.categories ?? []) as MediaCategory[],
    isPublic: Boolean(m.isPublic),
    privateGalleryTitles: m.privateGalleryTitles ?? [],
  };
}

const optionalCount = (value: number | null | undefined) =>
  value === null || value === undefined ? "" : String(value);

export function nftFieldsFrom(m: MediaItem | null): NftFields {
  if (!m) {
    return {
      price: "",
      currency: "ETH",
      editionType: "1/1",
      editionsTotal: "1",
      editionsRemaining: "1",
      openUntil: "",
      status: "available",
      marketplaceUrl: "",
    };
  }

  return {
    price: m.nft?.price === null || m.nft?.price === undefined ? "" : String(m.nft.price),
    currency: m.nft?.currency ?? "ETH",
    editionType: m.nft?.editionType ?? "1/1",
    editionsTotal: optionalCount(m.nft?.editionsTotal),
    editionsRemaining: optionalCount(m.nft?.editionsRemaining),
    openUntil: m.nft?.openUntil ? m.nft.openUntil.slice(0, 16) : "",
    status: m.nft?.status ?? "available",
    marketplaceUrl: m.nft?.marketplaceUrl ?? "",
  };
}

export function appearancesFrom(m: MediaItem | null): Appearance[] {
  return m && Array.isArray(m.appearances) ? m.appearances : [];
}
