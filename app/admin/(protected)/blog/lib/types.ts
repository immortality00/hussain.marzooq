export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryLabel: string;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  notifiedAt: string | null;
  /** Made from new media and not yet published or dismissed (U7). */
  waiting: boolean;
};

export type BlogCategoryOption = { id: string; name: string; slug: string };

export type BlogPostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImagePublicId: string;
  categoryId: string;
  tags: string[];
  author: string;
  isPublished: boolean;
};
