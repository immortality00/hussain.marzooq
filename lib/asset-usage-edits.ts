import { publicIdPattern, type AssetUsageKind } from "@/lib/asset-usage-locations";

/** `imageUrl`: what a picture slot shows instead of `url` (a moved video's first frame, U7). */
export type UsageEdit = { type: "remove" } | { type: "replace"; url: string; imageUrl?: string };

const URL_TOKEN = String.raw`https?:\/\/[^\s)"'<>\]]+`;
const LINK_TITLE = String.raw`(?:\s+(?:"[^"]*"|'[^']*'))?`;
const MARKDOWN_IMAGE = new RegExp(String.raw`!\[[^\]]*\]\(\s*<?(${URL_TOKEN})>?${LINK_TITLE}\s*\)`, "g");
const MARKDOWN_LINK = new RegExp(String.raw`\[([^\]]*)\]\(\s*<?(${URL_TOKEN})>?${LINK_TITLE}\s*\)`, "g");
const BARE_URL = new RegExp(URL_TOKEN, "g");
/** A still taken from a video (lib/cloudinary-delivery.ts videoFrameUrl), not the video itself. */
const VIDEO_FRAME = /\/video\/upload\/so_/;

export function editMarkdown(content: string, publicId: string, edit: UsageEdit) {
  const pattern = publicIdPattern(publicId);
  const uses = (url: string) => pattern.test(url);

  if (edit.type === "replace") {
    const picture = (url: string) => (edit.imageUrl && VIDEO_FRAME.test(url) ? edit.imageUrl : edit.url);
    return content.replace(BARE_URL, (url) => (uses(url) ? picture(url) : url));
  }

  return content
    .replace(MARKDOWN_IMAGE, (whole, url: string) => (uses(url) ? "" : whole))
    .replace(MARKDOWN_LINK, (whole, label: string, url: string) => (uses(url) ? label : whole))
    .replace(BARE_URL, (url) => (uses(url) ? "" : url));
}

export function editedValue(kind: AssetUsageKind, current: unknown, publicId: string, edit: UsageEdit) {
  const url = edit.type === "replace" ? edit.url : "";
  const picture = edit.type === "replace" ? (edit.imageUrl ?? url) : "";
  if (kind === "image") return { url: picture, publicId: "" };
  if (kind === "url") return picture;
  return editMarkdown(typeof current === "string" ? current : "", publicId, edit);
}
