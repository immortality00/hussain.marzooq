import { asString, asStringArray, isRecord } from "./common";

export type Appearance = {
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

export function sanitizeAppearances(v: unknown): Appearance[] {
  if (!Array.isArray(v)) return [];
  const out: Appearance[] = [];

  for (const item of v) {
    if (!isRecord(item)) continue;

    const kindRaw = asString(item.kind);
    const kind = kindRaw === "featured" ? "featured" : kindRaw === "exhibited" ? "exhibited" : null;
    if (!kind) continue;

    const title = asString(item.title).trim().slice(0, 160);
    const venue = asString(item.venue).trim().slice(0, 160);
    const city = asString(item.city).trim().slice(0, 120);
    const country = asString(item.country).trim().slice(0, 120);
    const dateFrom = asString(item.dateFrom).trim().slice(0, 32);
    const dateTo = asString(item.dateTo).trim().slice(0, 32);
    const notes = asString(item.notes).trim().slice(0, 2000);
    const link = asString(item.link).trim().slice(0, 500);

    if (!title && !venue) continue;

    out.push({ kind, title, venue, city, country, dateFrom, dateTo, notes, link });
    if (out.length >= 50) break;
  }

  return out;
}

export function isCloudinarySecureUrl(url: string): boolean {
  return /^https:\/\/res\.cloudinary\.com\//i.test(url.trim());
}

export function getMediaLists(v: Record<string, unknown>) {
  return {
    tags: asStringArray(v.tags),
    categories: asStringArray(v.categories),
    people: asStringArray(v.people),
  };
}