import type { Collection, Document, Filter } from "mongodb";
import { getDb } from "./db";
import { releasedMediaFilter } from "@/lib/media-schedule";

const MEDIA_CATEGORY_LABELS: { key: string; label: string }[] = [
  { key: "photography", label: "Photography" },
  { key: "videography", label: "Videography" },
  { key: "showreel", label: "Showreel" },
  { key: "nft", label: "NFT" },
  { key: "art", label: "Art" },
];

export type AdminDashboardStats = {
  media: {
    total: number;
    public: number;
    scheduled: number;
    byCategory: { key: string; label: string; count: number }[];
  };
  testimonials: { total: number; pending: number };
  inquiries: { new: number; active: number };
  people: number;
  removalRequests: number;
  services: number;
  privateGalleries: number;
  /** Blog drafts made from new media, still waiting (U7); worked out from the blog list. */
  blogDrafts: number;
};

const NOT_ARCHIVED = { isArchived: { $ne: true } };

async function facetCounts<K extends string>(
  collection: Collection,
  filters: Record<K, Filter<Document>>
): Promise<Record<K, number>> {
  const keys = Object.keys(filters) as K[];
  const [row] = await collection
    .aggregate<Record<K, { n: number }[]>>([
      { $facet: Object.fromEntries(keys.map((key) => [key, [{ $match: filters[key] }, { $count: "n" }]])) },
    ])
    .toArray();
  return Object.fromEntries(keys.map((key) => [key, row?.[key]?.[0]?.n ?? 0])) as Record<K, number>;
}

async function getMediaCounts() {
  const db = await getDb();
  const now = new Date();
  const [row] = await db
    .collection("media")
    .aggregate<{
      total: { n: number }[];
      public: { n: number }[];
      scheduled?: { n: number }[];
      byCategory: { _id: unknown; count: number }[];
    }>([
      {
        $facet: {
          total: [{ $count: "n" }],
          public: [{ $match: { isPublic: true, ...releasedMediaFilter(now) } }, { $count: "n" }],
          scheduled: [{ $match: { isPublic: true, publishAt: { $gt: now } } }, { $count: "n" }],
          byCategory: [{ $unwind: "$categories" }, { $group: { _id: "$categories", count: { $sum: 1 } } }],
        },
      },
    ])
    .toArray();

  const counts = new Map((row?.byCategory ?? []).map((entry) => [String(entry._id), Number(entry.count)]));
  return {
    total: row?.total[0]?.n ?? 0,
    public: row?.public[0]?.n ?? 0,
    scheduled: row?.scheduled?.[0]?.n ?? 0,
    byCategory: MEDIA_CATEGORY_LABELS.map((category) => ({
      ...category,
      count: counts.get(category.key) ?? 0,
    })),
  };
}

export async function getAdminDashboardStats(): Promise<Omit<AdminDashboardStats, "blogDrafts">> {
  const db = await getDb();
  const [testimonials, inquiries, people, media, services, privateGalleries] = await Promise.all([
    facetCounts(db.collection("testimonials"), { total: {}, pending: { isApproved: { $ne: true } } }),
    facetCounts(db.collection("inquiries"), {
      new: { status: "new", ...NOT_ARCHIVED },
      active: { status: { $nin: ["resolved", "rejected"] }, ...NOT_ARCHIVED },
    }),
    facetCounts(db.collection("people_profiles"), {
      total: {},
      removal: { removalRequestedAt: { $exists: true, $ne: null } },
    }),
    getMediaCounts(),
    db.collection("services").countDocuments({}),
    db.collection("private_galleries").countDocuments({}),
  ]);

  return {
    media,
    testimonials,
    inquiries,
    people: people.total,
    removalRequests: people.removal,
    services,
    privateGalleries,
  };
}
