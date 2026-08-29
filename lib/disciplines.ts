export type DisciplineSlug =
  | "photography"
  | "videography"
  | "nft"
  | "dancing"
  | "web-development";

export type Discipline = {
  slug: DisciplineSlug;
  label: string;
  href: string;
};

export const DISCIPLINES: Discipline[] = [
  { slug: "photography", label: "Photography", href: "/photography" },
  { slug: "videography", label: "Videography", href: "/videography" },
  { slug: "nft", label: "NFT", href: "/nft" },
  { slug: "dancing", label: "Dancing", href: "/dancing" },
  { slug: "web-development", label: "Web Development", href: "/web-development" },
];

export const DISCIPLINE_HREF: Record<DisciplineSlug, string> = {
  photography: "/photography",
  videography: "/videography",
  nft: "/nft",
  dancing: "/dancing",
  "web-development": "/web-development",
};

export function disciplineForCategory(category: string): DisciplineSlug | null {
  const c = category.trim().toLowerCase();
  if (c.includes("photo")) return "photography";
  if (c.includes("video") || c.includes("film") || c.includes("reel")) return "videography";
  if (c.includes("dance")) return "dancing";
  if (c.includes("nft")) return "nft";
  if (c.includes("web") || c.includes("dev") || c.includes("code")) return "web-development";
  return null;
}
