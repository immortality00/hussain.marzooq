import type { MediaCategory } from "./types";

export const MEDIA_CATEGORIES: Array<{ key: MediaCategory; label: string; hint: string }> = [
  { key: "photography", label: "Photography", hint: "Shows on /photography" },
  { key: "videography", label: "Videography", hint: "Shows on /videography/videos" },
  { key: "showreel", label: "Showreel", hint: "Used on videography showreel" },
  { key: "nft", label: "NFT", hint: "Shows on NFT page" },
  { key: "art", label: "Art", hint: "Shows on Art page" },
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