import type { Db, Document } from "mongodb";
import { buildMediaDraft } from "@/lib/media-draft";
import { editMarkdown } from "@/lib/asset-usage-edits";
import { mentionsPublicId } from "@/lib/asset-usage-locations";
import { CLOUDINARY_BLOG_FOLDER } from "@/lib/cloudinary-folders";
import { deleteManagedCloudinaryAsset } from "@/lib/server/cloudinary-assets";
import { draftFieldsFor } from "@/lib/server/draft-media";

// A draft made from new media (U7) waits until it is published. While it waits it follows its
// items: when one is deleted or made private, the draft drops it, or goes when nothing is left.

export const WAITING = { awaitingReview: true } as const;

function ids(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
}

function sameTime(a: unknown, b: unknown) {
  return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
}

/** Never edited since it was built, so it can simply be built again. */
export function isUntouchedDraft(post: Document) {
  return sameTime(post.updatedAt, post.draftBuiltAt);
}

export async function waitingDraftIdsByMedia(db: Db, mediaIds: string[]): Promise<Map<string, Set<string>>> {
  const byMedia = new Map<string, Set<string>>();
  if (mediaIds.length === 0) return byMedia;
  const posts = await db
    .collection("blog_posts")
    .find({ ...WAITING, sourceMediaIds: { $in: mediaIds } }, { projection: { sourceMediaIds: 1 } })
    .toArray();
  for (const post of posts) {
    for (const id of ids(post.sourceMediaIds)) {
      if (!byMedia.has(id)) byMedia.set(id, new Set());
      byMedia.get(id)!.add(String(post._id));
    }
  }
  return byMedia;
}

function stripped(post: Document, gone: Document[]) {
  let content = typeof post.content === "string" ? post.content : "";
  let cover = typeof post.coverImageUrl === "string" ? post.coverImageUrl : "";
  for (const doc of gone) {
    for (const publicId of [doc.publicId, doc.posterPublicId]) {
      if (typeof publicId !== "string" || !publicId) continue;
      content = editMarkdown(content, publicId, { type: "remove" }).replace(/\n{3,}/g, "\n\n").trim();
      if (mentionsPublicId(cover, publicId)) cover = "";
    }
  }
  return { content, coverImageUrl: cover };
}

async function deleteDraft(db: Db, post: Document) {
  const result = await db.collection("blog_posts").deleteOne({ _id: post._id, ...WAITING });
  const cover = typeof post.coverImageUrl === "string" ? post.coverImageUrl : "";
  if (result.deletedCount && cover) await deleteManagedCloudinaryAsset({ url: cover }, [CLOUDINARY_BLOG_FOLDER]);
}

async function retireOne(db: Db, post: Document, gone: Document[], goneIds: Set<string>) {
  const remaining = ids(post.sourceMediaIds).filter((id) => !goneIds.has(id));
  const now = new Date();

  if (remaining.length && isUntouchedDraft(post)) {
    const rebuilt = await draftFieldsFor(db, remaining);
    if (rebuilt) {
      const { title, excerpt, content, coverImageUrl, tags } = buildMediaDraft(rebuilt.items);
      await db.collection("blog_posts").updateOne(
        { _id: post._id, ...WAITING },
        {
          $set: { title, excerpt, content, coverImageUrl, tags, sourceMediaIds: rebuilt.ids, updatedAt: now, draftBuiltAt: now },
        }
      );
      return;
    }
  }

  if (!remaining.length) return deleteDraft(db, post);

  await db
    .collection("blog_posts")
    .updateOne({ _id: post._id, ...WAITING }, { $set: { ...stripped(post, gone), sourceMediaIds: remaining, updatedAt: now } });
}

/** `gone`: the media docs being deleted or made private (their _id, publicId, posterPublicId). */
export async function retireWaitingDrafts(db: Db, gone: Document[]) {
  if (gone.length === 0) return;
  try {
    const goneIds = new Set(gone.map((doc) => String(doc._id)));
    const posts = await db
      .collection("blog_posts")
      .find({ ...WAITING, sourceMediaIds: { $in: Array.from(goneIds) } })
      .toArray();
    for (const post of posts) await retireOne(db, post, gone, goneIds);
  } catch (error) {
    // The item's own change already stands; a draft left behind still shows in Blog to dismiss.
    console.error("[media-drafts] could not update waiting drafts", error);
  }
}
