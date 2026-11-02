import type { ContactPrefill, ServiceChoice, ServiceItem } from "./types";

export function safeTrim(v: string) {
  return v.trim().slice(0, 5000);
}

export function isValidEmail(email: string) {
  const v = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function looksLikeObjectId(s: string) {
  return /^[a-fA-F0-9]{24}$/.test(s.trim());
}

export function findInitialServiceMatch(services: ServiceItem[], initialService: string) {
  const raw = initialService.trim();
  if (!raw) return null;

  if (looksLikeObjectId(raw)) {
    return services.find((s) => s.id === raw) ?? null;
  }

  const target = normalize(raw);

  const bySlug = services.find((s) => normalize(s.slug) === target);
  if (bySlug) return bySlug;

  const byName = services.find((s) => normalize(s.name) === target);
  if (byName) return byName;

  return null;
}

export function getServiceCategories(services: ServiceItem[]) {
  const set = new Set<string>();
  for (const s of services) {
    const c = s.category?.trim();
    if (c) set.add(c);
  }
  set.add("others");
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
export const NO_PREFILL: ContactPrefill = { service: "", category: "", context: "" };

export function samePrefill(a: ContactPrefill, b: ContactPrefill) {
  return a.service === b.service && a.category === b.category && a.context === b.context;
}

/** The service and category fields as a booking link opens the form. */
export function startingChoice(services: ServiceItem[], categories: string[], prefill: ContactPrefill): ServiceChoice {
  const match = findInitialServiceMatch(services, prefill.service);
  const category = safeTrim(prefill.category);
  const known = category ? categories.find((c) => normalize(c) === normalize(category)) : undefined;

  if (match?.category) {
    return {
      serviceMode: "select",
      serviceId: match.id,
      otherService: "",
      categoryMode: "select",
      selectedCategory: match.category,
      otherCategory: "",
    };
  }
  return {
    serviceMode: match ? "select" : prefill.service.trim() ? "other" : "select",
    serviceId: match?.id ?? "",
    otherService: match ? "" : prefill.service,
    categoryMode: !category || known ? "select" : "other",
    selectedCategory: known ?? "others",
    otherCategory: !match && category && !known ? category : "",
  };
}
