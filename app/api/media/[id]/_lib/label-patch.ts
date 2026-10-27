import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { isValidTagSlug } from "@/lib/server/media-tags";

export const MAX_LABELS = 60;
// Tags already on an item may predate the taxonomy (free text); only new ones must be slugs.
const MAX_TAG_LENGTH = 200;

export type LabelPatch = { tags: string[] | null; peopleIds: string[] | null; clearPageUsages: boolean };

type Parsed = { ok: true; patch: LabelPatch } | { ok: false; error: string };

function textList(value: unknown, field: string, maxLength: number): string[] | { error: string } {
  if (!Array.isArray(value)) return { error: `${field} must be a list.` };
  if (value.length > MAX_LABELS) return { error: `A media item can have at most ${MAX_LABELS} ${field.toLowerCase()}.` };

  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") return { error: `${field} must be text.` };
    const text = entry.trim();
    if (!text) continue;
    if (text.length > maxLength) return { error: `${field}: “${text.slice(0, 40)}…” is too long.` };
    if (!out.includes(text)) out.push(text);
  }
  return out;
}

export function parseLabelPatch(body: Record<string, unknown> | null): Parsed {
  if (!body) return { ok: false, error: "Invalid body" };

  let tags: string[] | null = null;
  if ("tags" in body) {
    const list = textList(body.tags, "Tags", MAX_TAG_LENGTH);
    if (!Array.isArray(list)) return { ok: false, error: list.error };
    tags = list;
  }

  let peopleIds: string[] | null = null;
  if ("peopleIds" in body) {
    const list = textList(body.peopleIds, "People", 24);
    if (!Array.isArray(list)) return { ok: false, error: list.error };
    if (list.some((id) => !ObjectId.isValid(id) || id.length !== 24)) {
      return { ok: false, error: "People must be people profile ids." };
    }
    peopleIds = list;
  }

  if (!tags && !peopleIds) return { ok: false, error: "Nothing to change." };
  return { ok: true, patch: { tags, peopleIds, clearPageUsages: body.clearPageUsages === true } };
}

export async function findUnknownNewTag(db: Db, tags: string[], current: string[]): Promise<string | null> {
  const added = tags.filter((tag) => !current.includes(tag));
  const malformed = added.find((tag) => !isValidTagSlug(tag));
  if (malformed) return malformed;
  if (added.length === 0) return null;

  const known = await db
    .collection("media_tags")
    .find({ slug: { $in: added } }, { projection: { slug: 1 } })
    .toArray();
  const knownSlugs = new Set(known.map((doc) => String(doc.slug)));
  return added.find((tag) => !knownSlugs.has(tag)) ?? null;
}
