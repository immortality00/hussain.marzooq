import type { BlogListItem } from "./types";

// A post's status in the admin blog list, and the list's status filter in its address (`?status=`), so the
// dashboard's "Blog drafts waiting" opens it on Waiting.
export type PostStatus = "waiting" | "published" | "scheduled" | "draft";

export const BLOG_LIST = "blog";
export const BLOG_LIST_PARAMS = ["status"] as const;

export const STATUS_LABELS: Record<PostStatus, string> = {
  waiting: "Waiting",
  published: "Published",
  scheduled: "Scheduled",
  draft: "Draft",
};

export const STATUS_CLASSES: Record<PostStatus, string> = {
  waiting: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  published: "border-green-500/30 bg-green-500/10 text-foreground",
  scheduled: "border-green-500/30 bg-green-500/10 text-foreground",
  draft: "text-muted-foreground",
};

export const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "waiting", label: "Waiting" },
  { value: "draft", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

export function statusFilterOf(value: string): StatusFilter {
  return STATUS_FILTERS.find((filter) => filter.value === value)?.value ?? "";
}

export function statusOf(post: BlogListItem, now = Date.now()): PostStatus {
  if (post.waiting) return "waiting";
  if (!post.isPublished) return "draft";
  // A draft made from a scheduled item goes out with it (U7).
  return post.publishedAt && new Date(post.publishedAt).getTime() > now ? "scheduled" : "published";
}
