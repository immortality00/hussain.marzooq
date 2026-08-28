import type { Appearance } from "@/app/api/_lib/media";

export type { Appearance };

export type Uploaded = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
};

export type WidgetResult = { info?: unknown };

export type MediaCategory = "photography" | "videography" | "showreel" | "nft" | "art";

export type CryptoCurrency = "ETH" | "SOL" | "XTZ" | "BTC";
export type NftEditionType = "1/1" | "limited" | "open";
export type NftStatus = "available" | "sold" | "coming-soon";

export type NftMeta = {
  price: number | null;
  currency: CryptoCurrency;
  editionType: NftEditionType;
  editionsTotal: number | null;
  editionsRemaining: number | null;
  openUntil: string | null;
  status: NftStatus;
  marketplaceUrl: string | null;
};

export type MediaType = "image" | "video" | "embed";

export type MediaItem = {
  id: string;
  type: MediaType;
  title: string;
  description: string | null;
  location: string | null;
  locationId: string | null;
  locationLat: number | null;
  locationLon: number | null;
  locationCountryCode: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories: string[];
  peopleIds: string[];
  people: string[];
  appearances: Appearance[];
  nft: NftMeta | null;
  isPublic: boolean;
  secureUrl: string | null;
  publicId: string | null;
  resourceType: string | null;
  embedUrl: string | null;
};

export type PersonProfileOption = {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  isPublic: boolean;
  isPrivate: boolean;
};