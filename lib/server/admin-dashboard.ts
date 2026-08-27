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
  services: number;
  privateGalleries: number;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const db = await getDb();
  const media = db.collection("media");
  const testimonials = db.collection("testimonials");
  const inquiries = db.collection("inquiries");

  const [
    mediaTotal,
    mediaPublic,
    categoryAgg,
    testimonialsTotal,
    testimonialsPending,
    inquiriesTotal,
    inquiriesNew,
    inquiriesActive,
    people,
    services,
    privateGalleries,
  ] = await Promise.all([
    media.countDocuments({}),
    media.countDocuments({ isPublic: true }),
    media
      .aggregate<{ _id: unknown; count: number }>([
        { $unwind: "$categories" },
        { $group: { _id: "$categories", count: { $sum: 1 } } },
      ])
      .toArray(),
    testimonials.countDocuments({}),
    testimonials.countDocuments({ isApproved: { $ne: true } }),
    inquiries.countDocuments({}),
    inquiries.countDocuments({ status: "new" }),
    inquiries.countDocuments({ status: { $nin: ["resolved", "rejected"] } }),
    db.collection("people_profiles").countDocuments({}),
    db.collection("services").countDocuments({}),
    db.collection("private_galleries").countDocuments({}),
  ]);

  const counts = new Map(categoryAgg.map((row) => [String(row._id), Number(row.count)]));
  const byCategory = MEDIA_CATEGORY_LABELS.map((category) => ({
    ...category,
    count: counts.get(category.key) ?? 0,
  }));

  return {
    media: { total: mediaTotal, public: mediaPublic, byCategory },
    testimonials: { total: testimonialsTotal, pending: testimonialsPending },
    inquiries: { total: inquiriesTotal, new: inquiriesNew, active: inquiriesActive },
    people,
    services,
    privateGalleries,
  };
}
