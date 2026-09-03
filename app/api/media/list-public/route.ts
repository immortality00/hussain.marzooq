import { ObjectId } from "mongodb";
import { noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";
import { encodeMediaCursor } from "@/lib/media-cursor";
import {
  buildPublicMediaQuery,
  toPublicMediaItem,
} from "@/lib/server/media-serializers";

export const dynamic = "force-dynamic";

type PublicMediaMode = "image" | "video" | "all";

type Cursor = {
  createdAt: string;
  id: string;
};

const MAX_LIMIT = 60;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseLimit(value: string | null) {
  const parsed = Number(value ?? 24);
  if (!Number.isFinite(parsed)) return 24;
  return Math.min(Math.max(Math.floor(parsed), 1), MAX_LIMIT);
}

function parseMode(value: string | null): PublicMediaMode {
  if (value === "image" || value === "video" || value === "all") return value;
  return "all";
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

function makeCursor(item: { createdAt: string | null; id: string }) {
  if (!item.createdAt || !item.id) return null;

  return encodeMediaCursor({ createdAt: item.createdAt, id: item.id });
}

function buildSearchConditions(query: string, tag: string) {
  const conditions: Record<string, unknown>[] = [];

  if (query) {
    const regex = new RegExp(escapeRegExp(query), "i");

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

  if (tag) {
    conditions.push({ tags: tag });
  }

  return conditions;
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

export async function GET(req: Request) {
  const url = new URL(req.url);

  const legacyType = url.searchParams.get("type");
  const mode = parseMode(url.searchParams.get("mode"));
  const category = url.searchParams.get("category")?.trim() ?? null;
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
  const tag = (url.searchParams.get("tag") ?? "").trim().slice(0, 80);
  const limit = parseLimit(url.searchParams.get("limit"));
  const cursor = parseCursor(url.searchParams.get("cursor"));

  const baseQuery = buildPublicMediaQuery({
    type: legacyType ?? (mode === "image" ? "image" : "all"),
    category,
  });

  const conditions: Record<string, unknown>[] = [baseQuery];

  if (mode === "video") {
    conditions.push({ type: { $in: ["video", "embed"] } });
  }

  conditions.push(...buildSearchConditions(query, tag));

  const cursorCondition = buildCursorCondition(cursor);
  if (cursorCondition) conditions.push(cursorCondition);

  const finalQuery = conditions.length === 1 ? conditions[0] : { $and: conditions };

  const db = await getDb();

  const docs = await db
    .collection("media")
    .find(finalQuery)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .toArray();

  const hasMore = docs.length > limit;
  const pageDocs = hasMore ? docs.slice(0, limit) : docs;
  const items = pageDocs.map((doc) => toPublicMediaItem(doc as Record<string, unknown>));
  const nextCursor = hasMore && items.length > 0 ? makeCursor(items[items.length - 1]) : null;

  return noStoreJson({ items, nextCursor });
}