export const PUBLIC_MEDIA_PAGE_SIZE = 30;

export type MediaCursor = { createdAt: string; id: string };

export function encodeMediaCursor(cursor: MediaCursor): string {
  const json = JSON.stringify({ createdAt: cursor.createdAt, id: cursor.id });

  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  return Buffer.from(json, "utf8").toString("base64url");
}
