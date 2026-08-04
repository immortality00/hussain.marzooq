import type { ServiceCategory } from "./types";
import type { AdminActionFeedbackState } from "@/components/admin/action-feedback/AdminActionFeedback";

export type CreateServiceResponse = { ok: true; id: string } | { ok: false; error: string };

export type Banner = AdminActionFeedbackState;

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