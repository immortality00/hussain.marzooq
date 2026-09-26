import { publicIdPattern, type AssetUsageKind } from "@/lib/asset-usage-locations";

export type UsageEdit = { type: "remove" } | { type: "replace"; url: string };

const URL_TOKEN = String.raw`https?:\/\/[^\s)"'<>\]]+`;
const LINK_TITLE = String.raw`(?:\s+(?:"[^"]*"|'[^']*'))?`;
const MARKDOWN_IMAGE = new RegExp(String.raw`!\[[^\]]*\]\(\s*<?(${URL_TOKEN})>?${LINK_TITLE}\s*\)`, "g");
const MARKDOWN_LINK = new RegExp(String.raw`\[([^\]]*)\]\(\s*<?(${URL_TOKEN})>?${LINK_TITLE}\s*\)`, "g");
const BARE_URL = new RegExp(URL_TOKEN, "g");

export function editMarkdown(content: string, publicId: string, edit: UsageEdit) {
  const pattern = publicIdPattern(publicId);
  const uses = (url: string) => pattern.test(url);

  if (edit.type === "replace") {
    return content.replace(BARE_URL, (url) => (uses(url) ? edit.url : url));
  }

  return content
    .replace(MARKDOWN_IMAGE, (whole, url: string) => (uses(url) ? "" : whole))
    .replace(MARKDOWN_LINK, (whole, label: string, url: string) => (uses(url) ? label : whole))
    .replace(BARE_URL, (url) => (uses(url) ? "" : url));
}

export function editedValue(kind: AssetUsageKind, current: unknown, publicId: string, edit: UsageEdit) {
  const url = edit.type === "replace" ? edit.url : "";
  if (kind === "image") return { url, publicId: "" };
  if (kind === "url") return url;
  return editMarkdown(typeof current === "string" ? current : "", publicId, edit);
}
