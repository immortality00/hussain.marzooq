import { asNullableString, asStringArray, isRecord } from "@/app/api/_lib/common";
import { sanitizeAppearances } from "@/app/api/_lib/media";
import { getDb } from "@/lib/server/db";

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

function toPublicMediaItem(doc: Record<string, unknown>): PublicMediaItem {
  const asset = isRecord(doc.asset) ? doc.asset : {};

  const secureUrl =
    asNullableString(doc.secureUrl) ??
    asNullableString(asset.secureUrl) ??
    asNullableString((asset as Record<string, unknown>).secure_url);

  return {
    id: String(doc._id),
    type: asNullableString(doc.type) ?? "image",
    title: asNullableString(doc.title) ?? "",
    description: asNullableString(doc.description),
    location: asNullableString(doc.location),
    event: asNullableString(doc.event),
    year: typeof doc.year === "number" ? doc.year : null,
    tags: asStringArray(doc.tags),
    categories: asStringArray(doc.categories),
    people: asStringArray(doc.people),
    appearances: sanitizeAppearances(doc.appearances),
    secureUrl: secureUrl ?? null,
    embedUrl: asNullableString(doc.embedUrl) ?? asNullableString(asset.embedUrl),
    createdAt: doc.createdAt ? new Date(doc.createdAt as string | number | Date).toISOString() : null,
  };
}

async function listPublicMedia({
  type,
  category,
  limit,
}: {
  type: "all" | "image" | "video" | "embed";
  category?: string;
  limit: number;
}) {
  const db = await getDb();

  const query: Record<string, unknown> = {
    $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
  };

  if (type !== "all") {
    query.type = type;
  }

  if (category?.trim()) {
    query.categories = category.trim();
  }

  const docs = await db
    .collection("media")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => toPublicMediaItem(doc as Record<string, unknown>));
}

export async function getPhotographyItems(): Promise<PublicMediaItem[]> {
  const primary = await listPublicMedia({
    type: "image",
    category: "photography",
    limit: 60,
  });

  if (primary.length) return primary;

  return listPublicMedia({
    type: "image",
    limit: 60,
  });
}

export async function getVideographyItems(): Promise<PublicMediaItem[]> {
  const all = await listPublicMedia({
    type: "all",
    category: "videography",
    limit: 60,
  });

  return all.filter((item) => item.type === "video" || item.type === "embed");
}

export async function getShowreelUrl(): Promise<string | null> {
  const db = await getDb();

  const doc = await db.collection("site_settings").findOne({ key: "showreel" });
  return doc && typeof doc.value === "string" ? doc.value : null;
}