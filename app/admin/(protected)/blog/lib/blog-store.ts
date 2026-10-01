import type { BlogCategoryOption, BlogListItem, BlogPostFormValues } from "./types";
import type { SavedPost } from "./api";

export type BlogSlice = {
  posts: BlogListItem[];
  forms: Record<string, BlogPostFormValues>;
  categoryOptions: BlogCategoryOption[];
};

export function withSavedPost(blog: BlogSlice, saved: SavedPost): BlogSlice {
  const { item, form } = saved;
  return {
    ...blog,
    posts: [item, ...blog.posts.filter((p) => p.id !== item.id)],
    forms: { ...blog.forms, [item.id]: form },
  };
}

export function withoutPost(blog: BlogSlice, id: string): BlogSlice {
  const forms = { ...blog.forms };
  delete forms[id];
  return { ...blog, posts: blog.posts.filter((p) => p.id !== id), forms };
}
