import type { BlogCategoryOption, BlogListItem, BlogPostFormValues } from "./types";
import type { SavedPost } from "./api";

export type BlogSlice = {
  posts: BlogListItem[];
  forms: Record<string, BlogPostFormValues>;
  categoryOptions: BlogCategoryOption[];
};

// An edited post keeps its place (the list is newest first); a new one goes first.
export function withSavedPost(blog: BlogSlice, saved: SavedPost): BlogSlice {
  const { item, form } = saved;
  const listed = blog.posts.some((p) => p.id === item.id);
  return {
    ...blog,
    posts: listed ? blog.posts.map((p) => (p.id === item.id ? item : p)) : [item, ...blog.posts],
    forms: { ...blog.forms, [item.id]: form },
  };
}

export function withoutPost(blog: BlogSlice, id: string): BlogSlice {
  const forms = { ...blog.forms };
  delete forms[id];
  return { ...blog, posts: blog.posts.filter((p) => p.id !== id), forms };
}
