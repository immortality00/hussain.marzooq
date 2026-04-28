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
  appearances: Appearance[];
  secureUrl: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};