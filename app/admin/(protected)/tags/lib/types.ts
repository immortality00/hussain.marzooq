import type { TagDiscipline } from "@/lib/server/media-tags";

export type Tag = {
  id: string;
  label: string;
  slug: string;
  description: string;
  disciplines: TagDiscipline[];
  isActive: boolean;
  order: number;
  mediaCount: number;
};

export type TagPatch = Partial<
  Pick<Tag, "label" | "slug" | "description" | "disciplines" | "isActive" | "order">
>;

export type NewTag = {
  label: string;
  slug: string;
  description: string;
  disciplines: TagDiscipline[];
};
