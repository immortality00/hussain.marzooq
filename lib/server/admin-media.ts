import { ObjectId, type Db, type Document } from "mongodb";
import { asStringArray } from "@/app/api/_lib/common";
import { ADMIN_MEDIA_MAX, ADMIN_MEDIA_PAGE } from "@/lib/admin-data";
import { lookupPeople, pickPeople, sanitizeAppearances, uniquePeopleIds } from "@/app/api/_lib/media";
import { mediaAssetPath } from "@/lib/media-asset-path";
import { normalizeDeliveryType } from "./cloudinary-private";
import { getDb } from "./db";
import { toAdminMediaListItem } from "./media-serializers";
import { getPrivateGalleryTitlesByMedia } from "./private-gallery-admin";

type Cursor = {
  createdAt: string;
  id: string;
};

const DEFAULT_LIMIT = ADMIN_MEDIA_PAGE;
const MAX_LIMIT = ADMIN_MEDIA_MAX;
const MAX_ID_LOOKUP_LIMIT = ADMIN_MEDIA_MAX;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseLimit(value: string | null, maxLimit = MAX_LIMIT) {
  const parsed = Number(value ?? DEFAULT_LIMIT);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.floor(parsed), 1), maxLimit);
}

function parseCursor(value: string | null): Cursor | null {
  if (!value) return null;

  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;
    if (!decoded || typeof decoded !== "object") return null;

    const candidate = decoded as Partial<Cursor>;
    if (typeof candidate.createdAt !== "string" || typeof candidate.id !== "string") return null;

    const date = new Date(candidate.createdAt);
    if (Number.isNaN(date.getTime()) || !ObjectId.isValid(candidate.id)) return null;

    return { createdAt: candidate.createdAt, id: candidate.id };
  } catch {
    return null;
  }
}

function parseIds(value: string | null) {
  if (!value) return [];

  const ids = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => ObjectId.isValid(item))
    .slice(0, MAX_ID_LOOKUP_LIMIT);

  return Array.from(new Set(ids)).map((id) => new ObjectId(id));
}

function makeCursor(item: { createdAt: string | null; id: string }) {
  if (!item.createdAt || !item.id) return null;

  return Buffer.from(
    JSON.stringify({
      createdAt: item.createdAt,
      id: item.id,
    })
  ).toString("base64url");
}

function buildCursorCondition(cursor: Cursor | null) {
  if (!cursor) return null;

  const createdAt = new Date(cursor.createdAt);

  return {
    $or: [
      { createdAt: { $lt: createdAt } },
      {
        createdAt,
        _id: { $lt: new ObjectId(cursor.id) },
      },
    ],
  };
}

function buildQuery(params: URLSearchParams) {
  const ids = parseIds(params.get("ids"));
  if (ids.length > 0) return { query: { _id: { $in: ids } }, idsMode: true };

  const conditions: Record<string, unknown>[] = [];
  const q = (params.get("q") ?? "").trim().slice(0, 120);
  const category = (params.get("category") ?? "").trim().slice(0, 80);
  const type = (params.get("type") ?? "").trim();
  const visibility = (params.get("visibility") ?? "").trim();
  const cursor = parseCursor(params.get("cursor"));

  if (q) {
    const regex = new RegExp(escapeRegExp(q), "i");
    conditions.push({
      $or: [
        { title: regex },
        { description: regex },
        { location: regex },
        { event: regex },
        { tags: regex },
        { people: regex },
      ],
    });
  }

  if (category) conditions.push({ categories: category });
  if (type === "image" || type === "video" || type === "embed") conditions.push({ type });
  if (visibility === "public") conditions.push({ isPublic: true });
  if (visibility === "private") conditions.push({ isPublic: false });

  const cursorCondition = buildCursorCondition(cursor);
  if (cursorCondition) conditions.push(cursorCondition);

  return { query: conditions.length > 0 ? { $and: conditions } : {}, idsMode: false };
}

async function findAdminMediaPage(params: URLSearchParams) {
  const { query, idsMode } = buildQuery(params);
  const limit = idsMode ? parseLimit(params.get("limit"), MAX_ID_LOOKUP_LIMIT) : parseLimit(params.get("limit"));

  const db = await getDb();
  const docs = await db
    .collection("media")
    .find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(idsMode ? limit : limit + 1)
    .toArray();

  const hasMore = !idsMode && docs.length > limit;
  const pageDocs = hasMore ? docs.slice(0, limit) : docs;
  const items = pageDocs.map((doc) => toAdminMediaListItem(doc as Record<string, unknown>));
  const nextCursor = hasMore && items.length > 0 ? makeCursor(items[items.length - 1]) : null;

  return { db, docs: pageDocs, items, nextCursor };
}

export async function listAdminMedia(params: URLSearchParams) {
  const { items, nextCursor } = await findAdminMediaPage(params);
  return { items, nextCursor };
}

export async function listAdminMediaWithItems(params: URLSearchParams) {
  const { db, docs, items, nextCursor } = await findAdminMediaPage(params);
  const full = await serializeAdminMediaItems(db, docs);
  return { items, nextCursor, full: Object.fromEntries(full.map((item) => [item.id, item])) };
}

type MediaLookups = {
  people: Awaited<ReturnType<typeof lookupPeople>>;
  galleryTitles: Map<string, string[]>;
};

async function mediaLookups(db: Db, docs: Document[]): Promise<MediaLookups> {
  const personIds = Array.from(new Set(docs.flatMap((doc) => uniquePeopleIds(doc.peopleIds))));
  const [people, galleryTitles] = await Promise.all([
    lookupPeople(db, personIds),
    getPrivateGalleryTitlesByMedia(db, docs.map((doc) => String(doc._id))),
  ]);
  return { people, galleryTitles };
}

function toAdminMediaItem(doc: Document, lookups: MediaLookups) {
  const rawPeople = asStringArray(doc.people);
  const resolvedPeople = pickPeople(uniquePeopleIds(doc.peopleIds), lookups.people);
  const isPrivateDelivery = normalizeDeliveryType(doc.deliveryType) === "authenticated";

  return {
    id: String(doc._id),
    type: typeof doc.type === "string" ? doc.type : "image",
    title: typeof doc.title === "string" ? doc.title : "",
    description: typeof doc.description === "string" ? doc.description : null,
    location: typeof doc.location === "string" ? doc.location : null,
    locationId: typeof doc.locationId === "string" ? doc.locationId : null,
    locationLat: typeof doc.locationLat === "number" ? doc.locationLat : null,
    locationLon: typeof doc.locationLon === "number" ? doc.locationLon : null,
    locationCountryCode: typeof doc.locationCountryCode === "string" ? doc.locationCountryCode : null,
    event: typeof doc.event === "string" ? doc.event : null,
    year: typeof doc.year === "number" ? doc.year : null,
    tags: asStringArray(doc.tags),
    categories: asStringArray(doc.categories),
    peopleIds: resolvedPeople.peopleIds,
    people: resolvedPeople.people.length ? resolvedPeople.people : rawPeople,
    appearances: sanitizeAppearances(doc.appearances),
    nft: doc.nft && typeof doc.nft === "object" ? (JSON.parse(JSON.stringify(doc.nft)) as Record<string, unknown>) : null,
    isPublic: typeof doc.isPublic === "boolean" ? doc.isPublic : true,
    privateGalleryTitles: lookups.galleryTitles.get(String(doc._id)) ?? [],
    secureUrl: isPrivateDelivery
      ? mediaAssetPath(String(doc._id))
      : typeof doc.secureUrl === "string"
        ? doc.secureUrl
        : null,
    publicId: typeof doc.publicId === "string" ? doc.publicId : null,
    resourceType: typeof doc.resourceType === "string" ? doc.resourceType : null,
    embedUrl: typeof doc.embedUrl === "string" ? doc.embedUrl : null,
    posterUrl: typeof doc.posterUrl === "string" ? doc.posterUrl : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
}

export async function serializeAdminMediaItem(db: Db, doc: Document) {
  return toAdminMediaItem(doc, await mediaLookups(db, [doc]));
}

export async function serializeAdminMediaItems(db: Db, docs: Document[]) {
  const lookups = await mediaLookups(db, docs);
  return docs.map((doc) => toAdminMediaItem(doc, lookups));
}

export async function savedAdminMedia(db: Db, doc: Document) {
  return {
    item: await serializeAdminMediaItem(db, doc),
    listItem: toAdminMediaListItem(doc as Record<string, unknown>),
  };
}
