import { getDb } from "@/lib/server/db";
import { buildPublicMediaQuery } from "@/lib/server/media-serializers";
import type { TagDiscipline } from "@/lib/server/media-tags";

export type PublicMediaTag = {
  slug: string;
  label: string;
  description: string;
};

export type DisciplineTag = {
  slug: string;
  label: string;
  count: number;
};

type MediaMode = "image" | "video";

function serialize(doc: Record<string, unknown>): PublicMediaTag {
  return {
    slug: typeof doc.slug === "string" ? doc.slug : "",
    label: typeof doc.label === "string" ? doc.label : "",
    description: typeof doc.description === "string" ? doc.description : "",
  };
}

function disciplineMatch(category: string, mediaMode: MediaMode) {
  return {
    $and: [
      buildPublicMediaQuery({ type: mediaMode === "image" ? "image" : "all", category }),
      ...(mediaMode === "video" ? [{ type: { $in: ["video", "embed"] } }] : []),
    ],
  };
}

export async function getPublicMediaTag(slug: string): Promise<PublicMediaTag | null> {
  const db = await getDb();
  const doc = await db.collection("media_tags").findOne({ slug, isActive: true });
  return doc ? serialize(doc as Record<string, unknown>) : null;
}

// A tag earns a subpage/chip purely from the media: any active tag that at
// least one public item in this discipline carries. The `disciplines` field on
// media_tags is admin metadata only and does not gate the public page.
export async function getDisciplineTags({
  category,
  mediaMode,
}: {
  category: TagDiscipline;
  mediaMode: MediaMode;
}): Promise<DisciplineTag[]> {
  const db = await getDb();

  const countRows = await db
    .collection("media")
    .aggregate<{ _id: string; count: number }>([
      { $match: disciplineMatch(category, mediaMode) },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ])
    .toArray();

  const counts = new Map<string, number>();
  for (const row of countRows) {
    if (typeof row._id === "string" && row.count > 0) counts.set(row._id, row.count);
  }
  if (counts.size === 0) return [];

  const tags = await db
    .collection("media_tags")
    .find({ isActive: true, slug: { $in: [...counts.keys()] } })
    .toArray();

  // Most-used first, so the tags with the most work lead the nav row.
  return tags
    .map((doc) => {
      const slug = typeof doc.slug === "string" ? doc.slug : "";
      return {
        slug,
        label: typeof doc.label === "string" ? doc.label : slug,
        count: counts.get(slug) ?? 0,
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
