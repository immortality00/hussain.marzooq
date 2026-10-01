import { adminWrite } from "@/lib/client/admin-store";
import type { Category, CategoryPatch } from "./types";

export async function patchCategory(id: string, patch: CategoryPatch) {
  const res = await adminWrite(
    `/api/service-categories/${id}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) },
    ["serviceCategories", "services"]
  );

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Update failed");
}

export async function createCategoryRequest(name: string, slug: string): Promise<Category> {
  const res = await adminWrite(
    "/api/service-categories",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, slug }) },
    ["serviceCategories"]
  );

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; item?: Category; error?: string };
  if (!res.ok || !data.ok || !data.item) throw new Error(data.error ?? "Create failed");
  return data.item;
}

export async function deleteCategoryRequest(id: string) {
  const res = await adminWrite(`/api/service-categories/${id}`, { method: "DELETE" }, ["serviceCategories"]);
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; servicesCount?: number };

  if (!res.ok || !data.ok) {
    if (data.error === "CATEGORY_HAS_SERVICES") {
      throw new Error(`Cannot delete: ${data.servicesCount ?? "some"} services exist under it.`);
    }
    throw new Error(data.error ?? "Delete failed.");
  }
}