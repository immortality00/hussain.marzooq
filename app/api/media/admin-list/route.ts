import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";
import { toAdminMediaListItem } from "@/lib/server/media-serializers";

export const dynamic = "force-dynamic";

type Cursor = {
  createdAt: string;
  id: string;
};

const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 120;
const MAX_ID_LOOKUP_LIMIT = 300;

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

function buildQuery(url: URL) {
  const ids = parseIds(url.searchParams.get("ids"));
  if (ids.length > 0) return { query: { _id: { $in: ids } }, idsMode: true };

  const conditions: Record<string, unknown>[] = [];
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
  const category = (url.searchParams.get("category") ?? "").trim().slice(0, 80);
  const type = (url.searchParams.get("type") ?? "").trim();
  const visibility = (url.searchParams.get("visibility") ?? "").trim();
  const cursor = parseCursor(url.searchParams.get("cursor"));

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

export async function GET(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const url = new URL(req.url);
  const { query, idsMode } = buildQuery(url);
  const limit = idsMode
    ? parseLimit(url.searchParams.get("limit"), MAX_ID_LOOKUP_LIMIT)
    : parseLimit(url.searchParams.get("limit"));

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

  return noStoreJson({ ok: true, items, nextCursor });
}