import type { Db } from "mongodb";
import { getDb } from "@/lib/server/db";
import { buildPublicMediaQuery } from "@/lib/server/media-serializers";
import { disciplineMatch } from "@/lib/server/public-media-tags";
import { mergeNewest, newestBy, newestOf } from "@/lib/server/newest-dates";
import {
  EMPTY_SITEMAP_SOURCES,
  latest,
  newestIn,
  type DateMap,
  type SitemapSources,
} from "@/lib/sitemap-dates";

const PUBLIC_VISIBILITY = { $or: [{ isPublic: true }, { isPublic: { $exists: false } }] };

async function loadPeople(db: Db): Promise<DateMap> {
  const [profiles, mediaById, mediaByName] = await Promise.all([
    db
      .collection("people_profiles")
      .find(
        { ...PUBLIC_VISIBILITY, isPrivate: { $ne: true } },
        { projection: { slug: 1, name: 1, updatedAt: 1, createdAt: 1 } }
      )
      .toArray(),
    newestBy(db, "media", PUBLIC_VISIBILITY, "peopleIds", { unwind: true }),
    newestBy(db, "media", PUBLIC_VISIBILITY, "people", { unwind: true }),
  ]);

  const people: DateMap = new Map();
  for (const doc of profiles) {
    if (typeof doc.slug !== "string" || !doc.slug) continue;
    const at = latest(
      doc.updatedAt,
      doc.createdAt,
      mediaById.get(String(doc._id)),
      typeof doc.name === "string" ? mediaByName.get(doc.name) : undefined
    );
    if (at) people.set(doc.slug, at);
  }
  return people;
}

async function loadMedia(db: Db): Promise<SitemapSources["media"]> {
  const mediaIn = (category: string) =>
    newestOf(db, "media", buildPublicMediaQuery({ type: "all", category }));

  const [photography, videography, showreel, nft, exhibited] = await Promise.all([
    mediaIn("photography"),
    mediaIn("videography"),
    mediaIn("showreel"),
    mediaIn("nft"),
    newestOf(db, "media", {
      $and: [
        buildPublicMediaQuery({ type: "all" }),
        { appearances: { $elemMatch: { kind: "exhibited" } } },
      ],
    }),
  ]);
  return { photography, videography, showreel, nft, exhibited };
}

async function loadSources(db: Db): Promise<SitemapSources> {
  const [
    settings,
    sections,
    seo,
    serviceCategories,
    testimonials,
    blogCategories,
    media,
    services,
    posts,
    tags,
    photographyTagMedia,
    videographyTagMedia,
    people,
  ] = await Promise.all([
    newestBy(db, "page_settings", {}, "slug"),
    newestBy(db, "page_sections", {}, "slug"),
    newestBy(db, "page_seo", {}, "slug"),
    newestOf(db, "service_categories", {}),
    newestOf(db, "testimonials", { isApproved: true }),
    newestOf(db, "blog_categories", { isActive: true }),
    loadMedia(db),
    newestBy(db, "services", { isActive: true, isArchived: { $ne: true } }, "slug"),
    newestBy(db, "blog_posts", { isPublished: true, publishedAt: { $lte: new Date() } }, "slug", {
      fields: ["$updatedAt", "$createdAt", "$publishedAt"],
    }),
    newestBy(db, "media_tags", { isActive: true }, "slug"),
    newestBy(db, "media", disciplineMatch("photography", "image"), "tags", { unwind: true }),
    newestBy(db, "media", disciplineMatch("videography", "video"), "tags", { unwind: true }),
    loadPeople(db),
  ]);

  return {
    pages: mergeNewest(settings, sections, seo),
    pageSettings: newestIn(settings),
    serviceCategories,
    testimonials,
    blogCategories,
    media,
    services,
    posts,
    tags,
    tagMedia: { photography: photographyTagMedia, videography: videographyTagMedia },
    people,
  };
}

export async function getSitemapSources(): Promise<SitemapSources> {
  try {
    return await loadSources(await getDb());
  } catch (error) {
    console.error("[sitemap] could not load lastModified dates", error);
    return EMPTY_SITEMAP_SOURCES;
  }
}
