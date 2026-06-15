import { getDb } from "@/lib/server/db";

export type PublicServiceItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  startingPrice: number | null;
  currency: string;
  isActive: boolean;
  isArchived?: boolean;
  imageUrl: string;
  order: number;
};

export type PublicServiceCategoryItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
};

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function asBool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

export function workLinkForCategory(categorySlug: string): { href: string; label: string } {
  const c = categorySlug.trim().toLowerCase();

  if (c.includes("photo")) return { href: "/photography", label: "See photos" };
  if (c.includes("video") || c.includes("film") || c.includes("reel")) {
    return { href: "/videography", label: "See videos" };
  }
  if (c.includes("dance")) return { href: "/dancing", label: "See dancing" };
  if (c.includes("nft")) return { href: "/nft", label: "See NFTs" };
  if (c.includes("web") || c.includes("dev") || c.includes("code")) {
    return { href: "/web-development", label: "See web work" };
  }

  return { href: "/photography", label: "See my work" };
}

export async function getActiveServicesForContact() {
  const db = await getDb();

  const docs = await db
    .collection("services")
    .find({ isActive: true, isArchived: { $ne: true } })
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  return docs.map((d) => ({
    id: String(d._id),
    name: asString(d.name),
    slug: asString(d.slug),
    category: asString(d.category, "others"),
    startingPrice: asNumberOrNull(d.startingPrice),
    currency: asString(d.currency, "AED"),
  }));
}

export async function getPublicServicesData() {
  const db = await getDb();

  const [rawCategories, rawServices] = await Promise.all([
    db.collection("service_categories").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db
      .collection("services")
      .find({ isActive: true, isArchived: { $ne: true } })
      .sort({ order: 1, createdAt: -1 })
      .toArray(),
  ]);

  const categories: PublicServiceCategoryItem[] = rawCategories
    .map((category) => ({
      id: String(category._id),
      name: asString(category.name),
      slug: asString(category.slug),
      isActive: asBool(category.isActive, true),
      order: typeof category.order === "number" && Number.isFinite(category.order) ? category.order : 0,
    }))
    .filter((category) => category.isActive)
    .sort((a, b) => a.order - b.order);

  const services: PublicServiceItem[] = rawServices
    .map((service) => ({
      id: String(service._id),
      name: asString(service.name),
      slug: asString(service.slug),
      category: asString(service.category, "others"),
      description: asString(service.description),
      startingPrice: asNumberOrNull(service.startingPrice),
      currency: asString(service.currency, "AED"),
      isActive: asBool(service.isActive, true),
      isArchived: asBool(service.isArchived, false),
      imageUrl: asString(service.imageUrl),
      order: typeof service.order === "number" && Number.isFinite(service.order) ? service.order : 0,
    }))
    .filter((service) => service.isActive && !service.isArchived)
    .sort((a, b) => a.order - b.order);

  return { services, categories };
}