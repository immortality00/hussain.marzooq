export type Uploaded = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
};

export type WidgetResult = { info?: unknown };

export type MediaCategory = "photography" | "videography" | "showreel" | "nft" | "art";

export type Appearance = {
  kind: "featured" | "exhibited";
  title: string;
  venue: string;
  city: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  notes: string;
  link: string;
};

export type MediaType = "image" | "video" | "embed";

export type MediaItem = {
  id: string;
  type: MediaType;
  title: string;
  description: string | null;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories: string[];
  people: string[];
  appearances: Appearance[];
  isPublic: boolean;
  secureUrl: string | null;
  publicId: string | null;
  resourceType: string | null;
  embedUrl: string | null;
};