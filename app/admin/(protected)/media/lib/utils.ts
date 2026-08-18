import type { Appearance, MediaCategory } from "./types";

export const MEDIA_CATEGORIES: Array<{ key: MediaCategory; label: string }> = [
  { key: "photography", label: "Photography" },
  { key: "videography", label: "Videography" },
  { key: "showreel", label: "Showreel" },
  { key: "nft", label: "NFT" },
  { key: "art", label: "Art" },
];

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function getString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function appearanceError(a: Appearance): string | null {
  if (!a.title.trim()) return "Add a name (Title) — required to save this entry.";
  return null;
}

export function findFirstAppearanceError(
  appearances: Appearance[]
): { index: number; kind: Appearance["kind"]; message: string } | null {
  for (let i = 0; i < appearances.length; i++) {
    const message = appearanceError(appearances[i]);
    if (message) return { index: i, kind: appearances[i].kind, message };
  }
  return null;
}

export function validateEmbed(url: string) {
  const u = url.trim();
  if (!u) return false;
  return (
    u.startsWith("https://") &&
    (u.includes("youtube.com") || u.includes("youtu.be") || u.includes("vimeo.com"))
  );
}