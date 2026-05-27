import { asNullableString, asStringArray, isRecord } from "@/app/api/_lib/common";
import { sanitizeAppearances } from "@/app/api/_lib/media";

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
  publicId: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};

export type AdminMediaListItem = {
  id: string;
  type: string;
  title: string;
  secureUrl: string | null;
  embedUrl: string | null;
  categories: string[];
  tags: string[];
  location: string | null;
  peopleIds: string[];
  people: string[];
  event: string | null;
};

export function buildPublicMediaQuery({
  type,
  category,
}: {
  type?: "all" | "image" | "video" | "embed" | string | null;
  category?: string | null;
}) {
  const query: Record<string, unknown> = {
    $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
  };

  if (type && type !== "all") {
    query.type = type;
  }

  if (category?.trim()) {
    query.categories = category.trim();
  }

  return query;
}

function getAssetRecord(doc: Record<string, unknown>) {
  return isRecord(doc.asset) ? doc.asset : {};
}

export function toPublicMediaItem(doc: Record<string, unknown>): PublicMediaItem {
  const asset = getAssetRecord(doc);

  const secureUrl =
    asNullableString(doc.secureUrl) ??
    asNullableString(asset.secureUrl) ??
    asNullableString((asset as Record<string, unknown>).secure_url);

  const publicId = asNullableString(doc.publicId) ?? asNullableString(asset.publicId);
  const embedUrl = asNullableString(doc.embedUrl) ?? asNullableString(asset.embedUrl);

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
    publicId: publicId ?? null,
    embedUrl: embedUrl ?? null,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt
          ? new Date(doc.createdAt as string | number | Date).toISOString()
          : null,
  };
}

export function toAdminMediaListItem(doc: Record<string, unknown>): AdminMediaListItem {
  return {
    id: String(doc._id),
    type: typeof doc.type === "string" ? doc.type : "image",
    title: typeof doc.title === "string" ? doc.title : "",
    secureUrl: typeof doc.secureUrl === "string" ? doc.secureUrl : null,
    embedUrl: typeof doc.embedUrl === "string" ? doc.embedUrl : null,
    categories: asStringArray(doc.categories),
    tags: asStringArray(doc.tags),
    location: typeof doc.location === "string" ? doc.location : null,
    peopleIds: asStringArray(doc.peopleIds),
    people: asStringArray(doc.people),
    event: typeof doc.event === "string" ? doc.event : null,
  };
}