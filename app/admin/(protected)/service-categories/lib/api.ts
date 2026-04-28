import type { Category, CategoryPatch } from "./types";

export async function patchCategory(id: string, patch: CategoryPatch) {
  const res = await fetch(`/api/service-categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Update failed");
}

export async function fetchCategories() {
  const res = await fetch("/api/service-categories", { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; items?: Category[]; error?: string };
  if (!res.ok || !data.ok || !Array.isArray(data.items)) {
    throw new Error(data.error ?? "Refresh failed.");
  }
  return data.items;
}

export async function createCategoryRequest(name: string, slug: string) {
  const res = await fetch("/api/service-categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, slug }),
  });

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Create failed");
}

export async function deleteCategoryRequest(id: string) {
  const res = await fetch(`/api/service-categories/${id}`, { method: "DELETE" });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; servicesCount?: number };

  if (!res.ok || !data.ok) {
    if (data.error === "CATEGORY_HAS_SERVICES") {
      throw new Error(`Cannot delete: ${data.servicesCount ?? "some"} services exist under it.`);
    }
    throw new Error(data.error ?? "Delete failed.");
  }
}