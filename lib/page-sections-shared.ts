import type { DisciplineSlug } from "@/lib/disciplines";

// Client-safe types and constants for page_sections content. Kept separate
// from lib/server/page-sections.ts so client components can import values
// (not just types) without pulling the MongoDB driver into the browser bundle.

// An admin-controlled image, either uploaded fresh to Cloudinary (publicId set,
// so it can be cleaned up on replace) or picked from the existing media library
// (publicId empty — the media library owns it, we never delete it). `url` is
// what the public renders; an empty `url` means "no image".
export type SectionImage = { url: string; publicId: string };
export const EMPTY_SECTION_IMAGE: SectionImage = { url: "", publicId: "" };

export function isSectionImage(value: unknown): value is SectionImage {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).url === "string" &&
    typeof (value as Record<string, unknown>).publicId === "string"
  );
}

// Recursively walks any page-sections data blob and returns every non-empty
// uploaded publicId it contains. Used by the save routes to diff old vs new
// content and delete Cloudinary assets that were replaced or removed.
export function collectSectionImagePublicIds(value: unknown): string[] {
  const found: string[] = [];

  function walk(node: unknown) {
    if (isSectionImage(node)) {
      if (node.publicId.trim()) found.push(node.publicId.trim());
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node && typeof node === "object") {
      for (const item of Object.values(node)) walk(item);
    }
  }

  walk(value);
  return Array.from(new Set(found));
}

export type TextCard = { title: string; text: string; image: SectionImage };

// A TextCard that also names the discipline page it links to. `slug` is optional
// because cards saved before the picker existed carry no slug; the About page
// falls back to the old positional mapping for those until they are re-saved.
export type DisciplineCard = TextCard & { slug?: DisciplineSlug };
export type CtaCopy = { title: string; description: string; buttonLabel: string };

export type FeaturedCardSlug = DisciplineSlug;
export type FeaturedCard = {
  slug: FeaturedCardSlug;
  title: string;
  description: string;
  image: SectionImage;
};
