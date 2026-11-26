import type { Appearance } from "@/app/api/_lib/media";
import type { MediaPerson } from "@/lib/linked-people";

export type { Appearance, MediaPerson };

export type TagLink = { label: string; href: string };

/** The tag pages that exist, per discipline: a photo's tags open Photography's, a film's Videography's. */
export type TagLinks = Partial<Record<"photography" | "videography", Record<string, TagLink>>>;

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
  people: MediaPerson[];
  appearances: Appearance[];
  secureUrl: string | null;
  embedUrl: string | null;
  posterUrl: string | null;
  createdAt: string | null;
};
