import type { ServiceItem } from "./types";

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