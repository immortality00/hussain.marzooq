import { ObjectId, type Db, type Document } from "mongodb";
import { addedItemsContent, buildMediaDraft } from "@/lib/media-draft";
import { slugifyTag } from "@/lib/server/media-tags";
import { errorMessage } from "@/lib/error-message";
import { privateGalleryMediaIds } from "@/lib/server/media-delivery";
import { draftFieldsFor, loadDraftMedia } from "@/lib/server/draft-media";
import { isUntouchedDraft, WAITING } from "@/lib/server/waiting-drafts";

const AUTHOR = "Hussain Marzooq";
const SLUG_MAX = 60;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function freeSlug(db: Db, title: string) {
  const base = (slugifyTag(title) || "draft").slice(0, SLUG_MAX - 4).replace(/-+$/, "") || "draft";
  const taken = new Set(
    (
      await db
        .collection("blog_posts")
        .find({ slug: new RegExp(`^${escapeRegex(base)}(-\\d+)?$`) }, { projection: { slug: 1 } })
        .toArray()
    ).map((post) => String(post.slug))
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

function isDuplicateSource(error: unknown) {
  const e = error as { code?: number; keyPattern?: Record<string, unknown> };
  return e?.code === 11000 && Boolean(e.keyPattern && "sourceMediaIds" in e.keyPattern);
}

async function insertDraft(db: Db, docs: Document[], batchKey: string | null) {
  const draft = buildMediaDraft(await loadDraftMedia(db, docs));
  const now = new Date();
  try {
    const { insertedId } = await db.collection("blog_posts").insertOne({
      ...draft,
      slug: await freeSlug(db, draft.title),
      coverImagePublicId: "",
      categoryId: null,
      category: "",
      author: AUTHOR,
      isPublished: false,
      publishedAt: null,
      sourceMediaIds: docs.map((doc) => String(doc._id)),
      ...WAITING,
      ...(batchKey ? { draftBatch: batchKey } : {}),
      createdAt: now,
      updatedAt: now,
      draftBuiltAt: now,
    });
    return String(insertedId);
  } catch (error) {
    // Another request drafted the same item a moment earlier: one draft is the point.
    if (isDuplicateSource(error)) return null;
    throw error;
  }
}

async function addToDraft(db: Db, post: Document, docs: Document[]) {
  const sourceIds = [...(post.sourceMediaIds as string[]), ...docs.map((doc) => String(doc._id))];
  const now = new Date();

  if (isUntouchedDraft(post)) {
    const rebuilt = await draftFieldsFor(db, sourceIds);
    if (rebuilt) {
      await db.collection("blog_posts").updateOne(
        { _id: post._id, ...WAITING },
        { $set: { ...buildMediaDraft(rebuilt.items), sourceMediaIds: rebuilt.ids, updatedAt: now, draftBuiltAt: now } }
      );
      return String(post._id);
    }
  }

  const added = await loadDraftMedia(db, docs);
  const content = [typeof post.content === "string" ? post.content : "", addedItemsContent(added)]
    .filter(Boolean)
    .join("\n\n");
  const tags = Array.from(new Set([...(Array.isArray(post.tags) ? post.tags : []), ...buildMediaDraft(added).tags]));
  await db
    .collection("blog_posts")
    .updateOne({ _id: post._id, ...WAITING }, { $set: { content, tags, sourceMediaIds: sourceIds, updatedAt: now } });
  return String(post._id);
}

/**
 * One waiting draft for new items that are public, outside every private gallery and in no
 * draft yet. `batchKey` groups one batch upload: a retry adds its items to that batch's draft.
 * Returns the draft's id, or null when no item qualified.
 */
export async function createMediaDraft(db: Db, mediaIds: string[], batchKey: string | null = null) {
  const ids = Array.from(new Set(mediaIds.filter((id) => ObjectId.isValid(id))));
  if (ids.length === 0) return null;

  const [found, inGallery, drafted] = await Promise.all([
    db.collection("media").find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray(),
    privateGalleryMediaIds(db, ids),
    db.collection("blog_posts").distinct("sourceMediaIds", { sourceMediaIds: { $in: ids } }),
  ]);
  const byId = new Map(found.map((doc) => [String(doc._id), doc]));
  const already = new Set(drafted.map(String));
  const docs = ids.flatMap((id) => {
    const doc = byId.get(id);
    return doc && doc.isPublic === true && !inGallery.has(id) && !already.has(id) ? [doc] : [];
  });
  if (docs.length === 0) return null;

  if (batchKey) {
    const batchDraft = await db.collection("blog_posts").findOne({ draftBatch: batchKey, ...WAITING });
    if (batchDraft) return addToDraft(db, batchDraft, docs);
  }
  return insertDraft(db, docs, batchKey);
}

/** createMediaDraft for a route whose own save already stands: a failure becomes a message. */
export async function draftAfterSave(db: Db, mediaIds: string[], batchKey: string | null = null) {
  try {
    return { id: await createMediaDraft(db, mediaIds, batchKey), error: null };
  } catch (error) {
    console.error("[media-drafts] could not make a blog draft", error);
    return { id: null, error: errorMessage(error, "Could not build the draft.") };
  }
}

/**
 * A draft made from a scheduled item goes out with it: publishing early keeps the post back
 * until the latest of its items' publish times.
 */
export async function publishedAtWithMedia(db: Db, post: Document, publishedAt: Date) {
  const ids = Array.isArray(post.sourceMediaIds) ? post.sourceMediaIds.filter((id) => ObjectId.isValid(id)) : [];
  if (ids.length === 0) return publishedAt;
  const scheduled = await db
    .collection("media")
    .find(
      { _id: { $in: ids.map((id: string) => new ObjectId(id)) }, publishAt: { $gt: publishedAt } },
      { projection: { publishAt: 1 } }
    )
    .toArray();
  return scheduled.reduce<Date>(
    (latest, doc) => (doc.publishAt instanceof Date && doc.publishAt > latest ? doc.publishAt : latest),
    publishedAt
  );
}
