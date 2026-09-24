export type VideoRef =
  | { provider: "youtube"; id: string }
  | { provider: "vimeo"; id: string; hash: string | null };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{1,12}$/;
const VIMEO_HASH = /^[0-9a-f]{6,40}$/i;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
]);
const YOUTUBE_ID_PATHS = new Set(["shorts", "live", "embed", "v", "e"]);

function toUrl(raw: string): URL | null {
  const input = raw.trim();
  if (!input) return null;

  try {
    const url = new URL(input);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function youtubeId(url: URL, host: string): string | null {
  const parts = url.pathname.split("/").filter(Boolean);
  if (host === "youtu.be") return parts[0] ?? null;
  if (!YOUTUBE_HOSTS.has(host)) return null;
  if (parts[0] === "watch") return url.searchParams.get("v");
  return YOUTUBE_ID_PATHS.has(parts[0] ?? "") ? (parts[1] ?? null) : null;
}

function vimeoRef(url: URL, host: string): { id: string; hash: string | null } | null {
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;

  const parts = url.pathname.split("/").filter(Boolean);
  const videoAt = parts.findIndex((part) => part === "video" || part === "videos");
  const idAt = videoAt >= 0 ? videoAt + 1 : parts.findIndex((part) => VIMEO_ID.test(part));
  const id = idAt >= 0 ? parts[idAt] : undefined;
  if (!id || !VIMEO_ID.test(id)) return null;

  const hash = url.searchParams.get("h") ?? (videoAt < 0 && idAt === 0 ? parts[1] : null) ?? null;
  return { id, hash: hash && VIMEO_HASH.test(hash) ? hash : null };
}

export function parseVideoLink(raw: string): VideoRef | null {
  const url = toUrl(raw);
  if (!url) return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  const id = youtubeId(url, host);
  if (id !== null) return YOUTUBE_ID.test(id) ? { provider: "youtube", id } : null;

  const vimeo = vimeoRef(url, host);
  return vimeo ? { provider: "vimeo", ...vimeo } : null;
}

function embedBase(ref: VideoRef): string {
  return ref.provider === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${ref.id}`
    : `https://player.vimeo.com/video/${ref.id}`;
}

export function videoEmbedSrc(ref: VideoRef): string {
  return ref.provider === "vimeo" && ref.hash ? `${embedBase(ref)}?h=${ref.hash}` : embedBase(ref);
}

export function videoWatchUrl(ref: VideoRef): string {
  if (ref.provider === "youtube") return `https://www.youtube.com/watch?v=${ref.id}`;
  return ref.hash ? `https://vimeo.com/${ref.id}/${ref.hash}` : `https://vimeo.com/${ref.id}`;
}

export function embedUrlPattern(ref: VideoRef): RegExp {
  const base = embedBase(ref).replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  return new RegExp(`^${base}(?:[?#]|$)`);
}

export function toEmbedUrl(raw: string): string | null {
  const ref = parseVideoLink(raw);
  return ref ? videoEmbedSrc(ref) : null;
}

export function toVideoWatchUrl(raw: string): string {
  const ref = parseVideoLink(raw);
  return ref ? videoWatchUrl(ref) : raw;
}
