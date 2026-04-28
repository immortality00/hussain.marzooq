import { getBaseUrl } from "./get-base-url";

export type PublicAppearance = {
  kind: "featured" | "exhibited";
  title: string;
  venue: string;
  city: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  notes: string;
  link: string;
};

export type PublicMediaItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories: string[];
  people: string[];
  appearances: PublicAppearance[];
  secureUrl: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};

export type PublicVideoItem = {
  id: string;
  type: string;
  title: string;
  embedUrl: string | null;
  secureUrl: string | null;
  tags: string[];
  categories?: string[];
};

type PublicListResponse<T> = {
  items?: T[];
};

type ShowreelResponse = {
  embedUrl?: string | null;
};

async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as T | null;
}

export async function fetchPublicMediaList(url: string): Promise<PublicMediaItem[]> {
  const data = await fetchJson<PublicListResponse<PublicMediaItem>>(url);
  return Array.isArray(data?.items) ? data.items : [];
}

export async function fetchPublicVideoList(url: string): Promise<PublicVideoItem[]> {
  const data = await fetchJson<PublicListResponse<PublicVideoItem>>(url);
  return Array.isArray(data?.items) ? data.items : [];
}

export async function getPhotographyItems(): Promise<PublicMediaItem[]> {
  const base = await getBaseUrl();
  const primary = await fetchPublicMediaList(
    `${base}/api/media/list-public?type=image&category=photography&limit=60`
  );
  if (primary.length) return primary;

  return fetchPublicMediaList(`${base}/api/media/list-public?type=image&limit=60`);
}

export async function getVideographyItems(): Promise<PublicVideoItem[]> {
  const base = await getBaseUrl();
  const all = await fetchPublicVideoList(
    `${base}/api/media/list-public?type=all&category=videography&limit=60`
  );

  return all.filter((m) => m.type === "video" || m.type === "embed");
}

export async function getShowreelUrl(): Promise<string | null> {
  const base = await getBaseUrl();
  const data = await fetchJson<ShowreelResponse>(`${base}/api/site-settings/showreel`);
  return typeof data?.embedUrl === "string" ? data.embedUrl : null;
}