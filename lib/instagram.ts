const SHORTCODE = /^[A-Za-z0-9_-]+$/;

export function toInstagramEmbedUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "instagram.com") return null;

  const parts = url.pathname.split("/").filter(Boolean);
  const kindIndex = parts.findIndex((p) => p === "p" || p === "reel");
  if (kindIndex === -1) return null;

  const kind = parts[kindIndex];
  const shortcode = parts[kindIndex + 1];
  if (!shortcode || !SHORTCODE.test(shortcode)) return null;

  return `https://www.instagram.com/${kind}/${shortcode}/embed`;
}
