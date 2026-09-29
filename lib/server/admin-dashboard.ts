import { cache } from "react";
import type { Collection, Document, Filter } from "mongodb";
import { getDb } from "./db";

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
    byCategory: { key: string; label: string; count: number }[];
  };
  testimonials: { total: number; pending: number };
  inquiries: { total: number; new: number; active: number };
  people: number;
  removalRequests: number;
  services: number;
  privateGalleries: number;
  generatedAt: number;
};

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

const getAttentionCounts = cache(async () => {
  const db = await getDb();
  const [testimonials, inquiries, people] = await Promise.all([
    facetCounts(db.collection("testimonials"), { total: {}, pending: { isApproved: { $ne: true } } }),
    facetCounts(db.collection("inquiries"), {
      total: {},
      new: { status: "new" },
      active: { status: { $nin: ["resolved", "rejected"] } },
    }),
    facetCounts(db.collection("people_profiles"), {
      total: {},
      removal: { removalRequestedAt: { $exists: true, $ne: null } },
    }),
  ]);
  return { testimonials, inquiries, people };
});

async function getMediaCounts() {
  const db = await getDb();
  const [row] = await db
    .collection("media")
    .aggregate<{
      total: { n: number }[];
      public: { n: number }[];
      byCategory: { _id: unknown; count: number }[];
    }>([
      {
        $facet: {
          total: [{ $count: "n" }],
          public: [{ $match: { isPublic: true } }, { $count: "n" }],
          byCategory: [{ $unwind: "$categories" }, { $group: { _id: "$categories", count: { $sum: 1 } } }],
        },
      },
    ])
    .toArray();

  const counts = new Map((row?.byCategory ?? []).map((entry) => [String(entry._id), Number(entry.count)]));
  return {
    total: row?.total[0]?.n ?? 0,
    public: row?.public[0]?.n ?? 0,
    byCategory: MEDIA_CATEGORY_LABELS.map((category) => ({
      ...category,
      count: counts.get(category.key) ?? 0,
    })),
  };
}

export async function getAdminNotificationCount(): Promise<number> {
  const { testimonials, inquiries, people } = await getAttentionCounts();
  return testimonials.pending + inquiries.new + people.removal;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const db = await getDb();
  const [attention, media, services, privateGalleries] = await Promise.all([
    getAttentionCounts(),
    getMediaCounts(),
    db.collection("services").countDocuments({}),
    db.collection("private_galleries").countDocuments({}),
  ]);
  const { testimonials, inquiries, people } = attention;

  return {
    media,
    testimonials: { total: testimonials.total, pending: testimonials.pending },
    inquiries: { total: inquiries.total, new: inquiries.new, active: inquiries.active },
    people: people.total,
    removalRequests: people.removal,
    services,
    privateGalleries,
    generatedAt: Date.now(),
  };
}
