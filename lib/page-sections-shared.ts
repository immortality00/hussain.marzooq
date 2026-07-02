// Client-safe types and constants for page_sections content. Kept separate
// from lib/server/page-sections.ts so client components can import values
// (not just types) without pulling the MongoDB driver into the browser bundle.

export type TextCard = { title: string; text: string };
export type CtaCopy = { title: string; description: string; buttonLabel: string };

export const FEATURED_CARD_SLUGS = [
  "photography",
  "videography",
  "nft",
  "dancing",
  "web-development",
] as const;

export type FeaturedCardSlug = (typeof FEATURED_CARD_SLUGS)[number];
export type FeaturedCard = { slug: FeaturedCardSlug; title: string; description: string };
