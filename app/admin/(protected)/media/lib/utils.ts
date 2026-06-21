import type { MediaCategory } from "./types";

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

export function toList(csv: string): string[] {
  return csv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 60);
}

export function validateEmbed(url: string) {
  const u = url.trim();
  if (!u) return false;
  return (
    u.startsWith("https://") &&
    (u.includes("youtube.com") || u.includes("youtu.be") || u.includes("vimeo.com"))
  );
}