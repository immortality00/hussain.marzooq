export type { PrivateGalleryAdminItem as GalleryItem } from "@/lib/server/private-gallery-admin";

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