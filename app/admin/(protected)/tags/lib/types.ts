export type Tag = {
  id: string;
  label: string;
  slug: string;
  description: string;
  isActive: boolean;
  order: number;
  mediaCount: number;
};

export type TagPatch = Partial<
  Pick<Tag, "label" | "slug" | "description" | "isActive" | "order">
>;

export type NewTag = {
  label: string;
  slug: string;
  description: string;
};
