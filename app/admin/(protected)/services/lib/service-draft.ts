import type { Service, ServiceCategory } from "./types";

// What the service editor holds while it is open, as the fields show it.
export type ServiceDraft = {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  startingPrice: string;
  currency: string;
  imageUrl: string;
  isActive: boolean;
};

export function serviceDraftOf(initial: Service | null, categories: ServiceCategory[]): ServiceDraft {
  const others = categories.find((c) => c.slug === "others") ?? null;
  const categoryId =
    initial?.categoryId && categories.some((c) => c.id === initial.categoryId)
      ? initial.categoryId
      : others?.id ?? categories[0]?.id ?? "";

  return {
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    categoryId,
    description: initial?.description ?? "",
    startingPrice:
      initial?.startingPrice === null || initial?.startingPrice === undefined ? "" : String(initial.startingPrice),
    currency: initial?.currency ?? "AED",
    imageUrl: initial?.imageUrl ?? "",
    isActive: initial?.isActive ?? true,
  };
}

export function draftChanged(start: ServiceDraft, draft: ServiceDraft) {
  return (Object.keys(start) as (keyof ServiceDraft)[]).some((key) => start[key] !== draft[key]);
}
