import { adminWrite } from "@/lib/client/admin-store";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

export type BlogCategory = AdminSnapshot["blogCategories"][number];

const TOUCHES = ["blogCategories", "blog"] as const;
const JSON_HEADERS = { "Content-Type": "application/json" };

async function readError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as { error?: string; postsCount?: number } | null;
  if (data?.error === "CATEGORY_IN_USE") return `In use by ${data.postsCount ?? 0} post(s).`;
  if (data?.error === "Slug already exists") return "That slug is already used.";
  return data?.error ?? `Request failed (${res.status})`;
}

export async function createBlogCategory(name: string, slug: string): Promise<BlogCategory> {
  const res = await adminWrite(
    "/api/blog-categories",
    { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ name, slug }) },
    ["blogCategories"]
  );
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json().catch(() => null)) as { item?: BlogCategory } | null;
  if (!data?.item) throw new Error("Create failed.");
  return data.item;
}

export async function patchBlogCategory(id: string, body: Partial<BlogCategory>) {
  const res = await adminWrite(
    `/api/blog-categories/${id}`,
    { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(body) },
    TOUCHES
  );
  if (!res.ok) throw new Error(await readError(res));
}

export async function deleteBlogCategory(id: string, detach: boolean) {
  const res = await adminWrite(`/api/blog-categories/${id}${detach ? "?detach=1" : ""}`, { method: "DELETE" }, TOUCHES);
  if (!res.ok) throw new Error(await readError(res));
}
