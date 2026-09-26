import { PAGE_ROWS } from "@/app/admin/(protected)/pages/lib/rows";
import { DISCIPLINES } from "@/lib/disciplines";

export type AssetUsageKind = "image" | "url" | "markdown";

export type AssetUsage = {
  label: string;
  collection: "page_sections" | "page_settings" | "page_seo" | "blog_posts";
  key: { slug: string } | { id: string };
  path: string;
  kind: AssetUsageKind;
};

export type UsageSourceDocs = {
  sections: Record<string, unknown>[];
  settings: Record<string, unknown>[];
  seo: Record<string, unknown>[];
  posts: Record<string, unknown>[];
};

const SECTION_IMAGES = [
  { slug: "home", field: "hero", part: "hero", list: false },
  { slug: "home", field: "featuredCards", part: "featured card", list: true },
  { slug: "home", field: "creativeSystem", part: "creative system panel", list: false },
  { slug: "about", field: "disciplines", part: "discipline card", list: true },
] as const;

export const SECTION_IMAGE_SLUGS = Array.from(new Set(SECTION_IMAGES.map((entry) => entry.slug)));

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function publicIdPattern(publicId: string, flags = "") {
  return new RegExp(`/${escapeRegex(publicId)}(?=[.?#)\\s"'<>\\]]|$)`, flags);
}

export function mentionsPublicId(value: unknown, publicId: string) {
  return typeof value === "string" && publicId !== "" && publicIdPattern(publicId).test(value);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function pageLabel(slug: string, key: "sectionsSlug" | "seoSlug") {
  return PAGE_ROWS.find((row) => row[key] === slug)?.label ?? slug;
}

function sectionUsages(doc: Record<string, unknown>, publicId: string): AssetUsage[] {
  const slug = text(doc.slug);
  const data = record(doc.data);

  return SECTION_IMAGES.filter((entry) => entry.slug === slug).flatMap((entry) => {
    const value = data[entry.field];
    const nodes = entry.list
      ? (Array.isArray(value) ? value : []).map((node, i) => ({ node, path: `${entry.field}.${i}`, n: ` ${i + 1}` }))
      : [{ node: value, path: entry.field, n: "" }];

    return nodes
      .filter(({ node }) => mentionsPublicId(record(record(node).image).url, publicId))
      .map(({ path, n }) => ({
        label: `${pageLabel(slug, "sectionsSlug")} — ${entry.part}${n}`,
        collection: "page_sections" as const,
        key: { slug },
        path: `data.${path}.image`,
        kind: "image" as const,
      }));
  });
}

function settingsUsages(doc: Record<string, unknown>, publicId: string): AssetUsage[] {
  const discipline = DISCIPLINES.find((entry) => entry.slug === doc.slug);
  if (!discipline || !mentionsPublicId(record(doc.cardImage).url, publicId)) return [];
  return [
    {
      label: `Work overlay — ${discipline.label}`,
      collection: "page_settings",
      key: { slug: discipline.slug },
      path: "cardImage",
      kind: "image",
    },
  ];
}

function seoUsages(doc: Record<string, unknown>, publicId: string): AssetUsage[] {
  const slug = text(doc.slug);
  if (!slug || !mentionsPublicId(doc.ogImageUrl, publicId)) return [];
  return [
    {
      label: `${pageLabel(slug, "seoSlug")} — share image`,
      collection: "page_seo",
      key: { slug },
      path: "ogImageUrl",
      kind: "url",
    },
  ];
}

function postUsages(doc: Record<string, unknown>, publicId: string): AssetUsage[] {
  const id = String(doc._id ?? "");
  const title = text(doc.title).trim() || "Untitled";
  const places = [
    { path: "coverImageUrl", part: "cover", kind: "url" as const },
    { path: "content", part: "text", kind: "markdown" as const },
  ];

  return places
    .filter((place) => id && mentionsPublicId(doc[place.path], publicId))
    .map((place) => ({
      label: `Blog post “${title}” — ${place.part}`,
      collection: "blog_posts" as const,
      key: { id },
      path: place.path,
      kind: place.kind,
    }));
}

export function usagesInDocs(docs: UsageSourceDocs, publicId: string): AssetUsage[] {
  const id = publicId.trim();
  if (!id) return [];
  return [
    ...docs.sections.flatMap((doc) => sectionUsages(doc, id)),
    ...docs.settings.flatMap((doc) => settingsUsages(doc, id)),
    ...docs.seo.flatMap((doc) => seoUsages(doc, id)),
    ...docs.posts.flatMap((doc) => postUsages(doc, id)),
  ];
}
