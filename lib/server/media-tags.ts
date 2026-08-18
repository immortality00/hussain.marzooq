export const TAG_DISCIPLINES = [
  "photography",
  "videography",
  "nft",
  "dancing",
  "web-development",
] as const;

export type TagDiscipline = (typeof TAG_DISCIPLINES)[number];

export const RESERVED_TAG_SLUGS = ["videos"] as const;

export function slugifyTag(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export function isValidTagSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 60;
}

export function isReservedTagSlug(slug: string): boolean {
  return (RESERVED_TAG_SLUGS as readonly string[]).includes(slug);
}

export function sanitizeDisciplines(v: unknown): TagDiscipline[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<TagDiscipline>();
  for (const raw of v) {
    const s = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if ((TAG_DISCIPLINES as readonly string[]).includes(s)) seen.add(s as TagDiscipline);
  }
  return TAG_DISCIPLINES.filter((d) => seen.has(d));
}
