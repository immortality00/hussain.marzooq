import type { BlogCategoryOption, BlogListItem, BlogPostFormValues } from "./types";

export type BlogSlice = {
  posts: BlogListItem[];
  forms: Record<string, BlogPostFormValues>;
  categoryOptions: BlogCategoryOption[];
};

export function withSavedPost(blog: BlogSlice, id: string, values: BlogPostFormValues): BlogSlice {
  const now = new Date().toISOString();
  const category = blog.categoryOptions.find((c) => c.id === values.categoryId);
  const previous = blog.posts.find((p) => p.id === id);
  const item: BlogListItem = {
    id,
    title: values.title,
    slug: values.slug,
    category: category?.slug ?? "",
    categoryLabel: category?.name ?? "",
    isPublished: values.isPublished,
    publishedAt: values.isPublished ? (previous?.publishedAt ?? now) : null,
    updatedAt: now,
  };
  return {
    ...blog,
    posts: [item, ...blog.posts.filter((p) => p.id !== id)],
    forms: { ...blog.forms, [id]: values },
  };
}

export function withoutPost(blog: BlogSlice, id: string): BlogSlice {
  const forms = { ...blog.forms };
  delete forms[id];
  return { ...blog, posts: blog.posts.filter((p) => p.id !== id), forms };
}
