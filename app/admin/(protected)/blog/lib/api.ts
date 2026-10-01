import { adminWrite } from "@/lib/client/admin-store";
import { expectVersion, throwIfRecordChanged } from "@/lib/record-changed";
import type { BlogListItem, BlogPostFormValues } from "./types";

export type SavedPost = { item: BlogListItem; form: BlogPostFormValues };

const TOUCHES = ["blog", "blogCategories"] as const;
const JSON_HEADERS = { "Content-Type": "application/json" };

const ERROR_MESSAGES: Record<string, string> = {
  "Slug already exists": "That slug is already used by another post.",
  "Invalid slug": "Slug must be lowercase letters, numbers, and dashes.",
  "Title is required": "Title is required.",
  CATEGORY_NOT_FOUND: "The selected category no longer exists.",
};

async function readSaved(res: Response): Promise<SavedPost> {
  const data = (await res.json().catch(() => null)) as (Partial<SavedPost> & { error?: string }) | null;
  if (!res.ok) {
    throwIfRecordChanged(data);
    const code = data?.error ?? `Request failed (${res.status})`;
    throw new Error(ERROR_MESSAGES[code] ?? code);
  }
  if (!data?.item || !data.form) throw new Error("The server did not return the saved post.");
  return { item: data.item, form: data.form };
}

export async function createPost(values: BlogPostFormValues): Promise<SavedPost> {
  return readSaved(
    await adminWrite("/api/blog", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(values) }, TOUCHES)
  );
}

export async function updatePost(id: string, patch: Partial<BlogPostFormValues>, expected?: string | null): Promise<SavedPost> {
  const headers = { ...JSON_HEADERS, ...expectVersion(expected) };
  return readSaved(await adminWrite(`/api/blog/${id}`, { method: "PATCH", headers, body: JSON.stringify(patch) }, TOUCHES));
}

export async function deletePost(id: string): Promise<void> {
  const res = await adminWrite(`/api/blog/${id}`, { method: "DELETE" }, TOUCHES);
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
}
