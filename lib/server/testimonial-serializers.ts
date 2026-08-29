import { asStringArray } from "@/app/api/_lib/common";

export type AdminTestimonialItem = {
  id: string;
  name: string;
  email: string | null;
  about: string | null;
  location: string | null;
  review: string;
  rating: number;
  profilePhotoUrl: string | null;
  photoUrls: string[];
  isApproved: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

function normalizePhotoUrls(value: unknown) {
  return asStringArray(value, 12);
}

export function toAdminTestimonialItem(doc: Record<string, unknown>): AdminTestimonialItem {
  return {
    id: String(doc._id),
    name: typeof doc.name === "string" ? doc.name : "",
    email: typeof doc.email === "string" ? doc.email : null,
    about: typeof doc.about === "string" ? doc.about : null,
    location: typeof doc.location === "string" ? doc.location : null,
    review: typeof doc.review === "string" ? doc.review : "",
    rating:
      typeof doc.rating === "number" && doc.rating >= 1 && doc.rating <= 5 ? doc.rating : 0,
    profilePhotoUrl: typeof doc.profilePhotoUrl === "string" ? doc.profilePhotoUrl : null,
    photoUrls: normalizePhotoUrls(doc.photoUrls),
    isApproved: typeof doc.isApproved === "boolean" ? doc.isApproved : false,
    sortOrder: typeof doc.sortOrder === "number" ? doc.sortOrder : 100,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : null,
  };
}