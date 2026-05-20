import clientPromise from "@/lib/mongodb";

export type PublicTestimonial = {
  id: string;
  name: string;
  about: string | null;
  review: string;
  rating: number;
  photoUrls: string[];
  featured: boolean;
};

export type PublicTestimonialsData = {
  items: PublicTestimonial[];
  totalReviews: number;
  averageRating: number;
};

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];
}

export async function getPublicTestimonials(limit = 60): Promise<PublicTestimonialsData> {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("testimonials")
    .find({ isApproved: true })
    .sort({ featured: -1, sortOrder: 1, updatedAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  const items: PublicTestimonial[] = docs.map((doc) => ({
    id: String(doc._id),
    name: typeof doc.name === "string" ? doc.name : "",
    about: typeof doc.about === "string" ? doc.about : null,
    review: typeof doc.review === "string" ? doc.review : "",
    rating:
      typeof doc.rating === "number" && doc.rating >= 1 && doc.rating <= 5
        ? doc.rating
        : 5,
    photoUrls: normalizeStringArray(doc.photoUrls),
    featured: typeof doc.featured === "boolean" ? doc.featured : false,
  }));

  const totalReviews = items.length;
  const averageRating =
    totalReviews > 0
      ? Math.round((items.reduce((sum, item) => sum + item.rating, 0) / totalReviews) * 10) / 10
      : 0;

  return {
    items,
    totalReviews,
    averageRating,
  };
}