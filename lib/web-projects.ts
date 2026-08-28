function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function toProjectUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Parse as-is first so an explicit non-http(s) scheme (mailto:, javascript:,
  // ftp://) is caught and rejected. A scheme-less domain fails this parse, so
  // fall back to assuming https — "add a link" should accept "mysite.com".
  let url = parseUrl(trimmed);
  if (url) {
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  } else {
    url = parseUrl(`https://${trimmed}`);
    if (!url) return null;
  }

  if (!url.hostname.includes(".")) return null;

  return url.href;
}

export function projectUrlLabel(input: string): string {
  const normalized = toProjectUrl(input);
  if (!normalized) return input.trim();

  const url = new URL(normalized);
  return url.hostname.replace(/^www\./, "");
}
