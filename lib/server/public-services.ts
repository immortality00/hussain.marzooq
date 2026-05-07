import clientPromise from "@/lib/mongodb";
import { getBaseUrl } from "./get-base-url";

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

function extractItems<T>(json: unknown): T[] {
  if (!json || typeof json !== "object") return [];
  const obj = json as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items as T[];
  if (obj.ok === true && Array.isArray(obj.items)) return obj.items as T[];
  return [];
}

export function workLinkForCategory(categorySlug: string): { href: string; label: string } {
  const c = categorySlug.trim().toLowerCase();

  if (c.includes("photo")) return { href: "/photography", label: "See photos" };

  if (c.includes("video") || c.includes("film") || c.includes("reel")) {
    return { href: "/videography", label: "See videos" };
  }

  if (c.includes("dance")) return { href: "/dance", label: "See dance" };
  if (c.includes("nft")) return { href: "/nft", label: "See NFTs" };

  if (c.includes("web") || c.includes("dev") || c.includes("code")) {
    return { href: "/web-dev", label: "See web work" };
  }

  return { href: "/photography", label: "See my work" };
}

export async function getActiveServicesForContact() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

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
  const baseUrl = await getBaseUrl();

  const [servicesRes, categoriesRes] = await Promise.all([
    fetch(`${baseUrl}/api/services`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/service-categories`, { cache: "no-store" }),
  ]);

  const servicesJson = (await servicesRes.json().catch(() => null)) as unknown;
  const categoriesJson = (await categoriesRes.json().catch(() => null)) as unknown;

  const rawServices = extractItems<PublicServiceItem>(servicesJson);
  const rawCategories = extractItems<PublicServiceCategoryItem>(categoriesJson);

  const categories = rawCategories
    .filter((c) => asBool(c.isActive, false))
    .sort((a, b) => (asNumberOrNull(a.order) ?? 0) - (asNumberOrNull(b.order) ?? 0));

  const services = rawServices
    .filter((s) => asBool(s.isActive, true))
    .sort((a, b) => (asNumberOrNull(a.order) ?? 0) - (asNumberOrNull(b.order) ?? 0));

  return { services, categories };
}