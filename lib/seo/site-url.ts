const FALLBACK_SITE_URL = "https://hussain-marzooq.com";

export function normalizeSiteUrl(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return FALLBACK_SITE_URL;
  return trimmed.replace(/\/+$/, "");
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function absoluteUrl(path: string): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}
