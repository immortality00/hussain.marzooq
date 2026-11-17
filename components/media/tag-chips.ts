// A discipline page's tag row: "All" (the discipline page itself) first, then a chip per tag
// page. Plain module, so the server builds the row and the client draws it.
export type TagChip = {
  slug: string;
  label: string;
  href: string;
};

export const ALL_TAGS_SLUG = "";

export function withAllChip(basePath: string, chips: TagChip[]): TagChip[] {
  if (chips.length === 0) return chips;
  return [{ slug: ALL_TAGS_SLUG, label: "All", href: basePath }, ...chips];
}
