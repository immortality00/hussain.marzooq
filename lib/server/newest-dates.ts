import type { Db, Document, Filter } from "mongodb";
import { latest, type DateMap } from "@/lib/sitemap-dates";

const EDIT_FIELDS = ["$updatedAt", "$createdAt"];

export async function newestOf(
  db: Db,
  collection: string,
  filter: Filter<Document>,
  fields: string[] = EDIT_FIELDS
): Promise<Date | undefined> {
  const [row] = await db
    .collection(collection)
    .aggregate<{ at?: unknown }>([
      { $match: filter },
      { $group: { _id: null, at: { $max: { $max: fields } } } },
    ])
    .toArray();
  return latest(row?.at);
}

export async function newestBy(
  db: Db,
  collection: string,
  filter: Filter<Document>,
  key: string,
  { unwind = false, fields = EDIT_FIELDS }: { unwind?: boolean; fields?: string[] } = {}
): Promise<DateMap> {
  const rows = await db
    .collection(collection)
    .aggregate<{ _id: unknown; at?: unknown }>([
      { $match: filter },
      ...(unwind ? [{ $unwind: `$${key}` }] : []),
      { $group: { _id: `$${key}`, at: { $max: { $max: fields } } } },
    ])
    .toArray();

  const map: DateMap = new Map();
  for (const row of rows) {
    const at = latest(row.at);
    if (typeof row._id === "string" && row._id && at) map.set(row._id, at);
  }
  return map;
}

export function mergeNewest(...maps: DateMap[]): DateMap {
  const merged: DateMap = new Map();
  for (const map of maps) {
    for (const [key, at] of map) {
      const current = merged.get(key);
      if (!current || at > current) merged.set(key, at);
    }
  }
  return merged;
}
