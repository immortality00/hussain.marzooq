import type { ServiceCategory } from "./types";

export type CreateServiceResponse = { ok: true; id: string } | { ok: false; error: string };

export type Banner = { type: "ok" | "err" | "info"; text: string } | null;

export function isCreateServiceResponse(v: unknown): v is CreateServiceResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r.ok === true) return typeof r.id === "string";
  if (r.ok === false) return typeof r.error === "string";
  return false;
}

export function findCategoryById(categories: ServiceCategory[], categoryId: string | null | undefined) {
  if (!categoryId) return null;
  return categories.find((c) => c.id === categoryId) ?? null;
}

export function findOthersCategory(categories: ServiceCategory[]) {
  return categories.find((c) => c.slug === "others") ?? null;
}