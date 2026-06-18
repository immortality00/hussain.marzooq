export type GalleryItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mediaIds: string[];
  isActive: boolean;
  expiresAtLocal: string;
};

export type MediaItem = {
  id: string;
  type: string;
  title: string;
  secureUrl: string | null;
  embedUrl: string | null;
  categories: string[];
  tags: string[];
  location: string | null;
  people: string[];
  event: string | null;
  createdAt?: string | null;
};