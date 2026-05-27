import { getDb } from "@/lib/server/db";
import {
  toPublicTestimonial,
  type PublicTestimonial,
} from "@/lib/server/testimonial-serializers";

export type { PublicTestimonial } from "@/lib/server/testimonial-serializers";

export type PublicTestimonialsData = {
  items: PublicTestimonial[];
  totalReviews: number;
  averageRating: number;
};

export async function getPublicTestimonials(limit = 60): Promise<PublicTestimonialsData> {
  const db = await getDb();

  const docs = await db
    .collection("testimonials")
    .find({ isApproved: true })
    .sort({ sortOrder: 1, updatedAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  const items = docs.map((doc) => toPublicTestimonial(doc as Record<string, unknown>));

  const totalReviews = items.length;
  const averageRating =
    totalReviews > 0
      ? Math.round((items.reduce((sum, item) => sum + item.rating, 0) / totalReviews) * 10) / 10
      : 0;

  return { items, totalReviews, averageRating };
}