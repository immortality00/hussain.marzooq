import type { BlogListItem, BlogPostFormValues } from "./types";

const ERROR_MESSAGES: Record<string, string> = {
  "Slug already exists": "That slug is already used by another post.",
  "Invalid slug": "Slug must be lowercase letters, numbers, and dashes.",
  "Title is required": "Title is required.",
  CATEGORY_NOT_FOUND: "The selected category no longer exists.",
};

async function readError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  const code = data?.error ?? `Request failed (${res.status})`;
  return ERROR_MESSAGES[code] ?? code;
}

export async function fetchPosts(): Promise<BlogListItem[]> {
  const res = await fetch("/api/blog", { cache: "no-store" });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { items: BlogListItem[] };
  return data.items;
}

export async function createPost(values: BlogPostFormValues): Promise<string> {
  const res = await fetch("/api/blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function updatePost(id: string, patch: Partial<BlogPostFormValues>): Promise<void> {
  const res = await fetch(`/api/blog/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await readError(res));
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await readError(res));
}
