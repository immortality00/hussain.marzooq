import type { Appearance } from "@/app/api/_lib/media";

export type { Appearance };

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