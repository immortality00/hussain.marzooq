import { getDb } from "@/lib/server/db";
import { sanitizeAppearances, type Appearance } from "@/app/api/_lib/media";

export type PublicNftItem = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  people: string[];
  categories: string[];
  appearances: Appearance[];
  mediaUrl: string | null;
  mediaType: "image" | "video";
  nft: {
    price: number | null;
    currency: "ETH" | "SOL" | "XTZ" | "BTC";
    editionType: "1/1" | "limited" | "open";
    editionsTotal: number | null;
    editionsRemaining: number | null;
    openUntil: string | null;
    status: "available" | "sold" | "coming-soon";
    marketplaceUrl: string | null;
  };
};

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

async function getPublicNftsImpl(): Promise<PublicNftItem[]> {
  const db = await getDb();

  const docs = await db
    .collection("media")
    .find({
      categories: "nft",
      $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
      nft: { $type: "object" },
    })
    .sort({ createdAt: -1 })
    .toArray();

  return docs
    .map((d) => ({
      id: String(d._id),
      title: typeof d.title === "string" ? d.title : "",
      description: typeof d.description === "string" ? d.description : null,
      location: typeof d.location === "string" ? d.location : null,
      event: typeof d.event === "string" ? d.event : null,
      year: typeof d.year === "number" ? d.year : null,
      tags: normalizeStringArray(d.tags),
      people: normalizeStringArray(d.people),
      categories: normalizeStringArray(d.categories),
      appearances: sanitizeAppearances(d.appearances),
      mediaUrl: typeof d.secureUrl === "string" ? d.secureUrl : null,
      mediaType: d.type === "video" ? "video" : "image",
      nft:
        d.nft &&
        typeof d.nft === "object" &&
        typeof d.nft.editionType === "string" &&
        typeof d.nft.status === "string"
          ? {
              price: typeof d.nft.price === "number" ? d.nft.price : null,
              currency:
                d.nft.currency === "SOL" || d.nft.currency === "XTZ" || d.nft.currency === "BTC"
                  ? d.nft.currency
                  : "ETH",
              editionType:
                d.nft.editionType === "limited" || d.nft.editionType === "open"
                  ? d.nft.editionType
                  : "1/1",
              editionsTotal: typeof d.nft.editionsTotal === "number" ? d.nft.editionsTotal : null,
              editionsRemaining:
                typeof d.nft.editionsRemaining === "number" ? d.nft.editionsRemaining : null,
              openUntil: typeof d.nft.openUntil === "string" ? d.nft.openUntil : null,
              status:
                d.nft.status === "sold" || d.nft.status === "coming-soon"
                  ? d.nft.status
                  : "available",
              marketplaceUrl:
                typeof d.nft.marketplaceUrl === "string" ? d.nft.marketplaceUrl : null,
            }
          : null,
    }))
    .filter((item): item is PublicNftItem => !!item.nft);
}

export async function getPublicNfts(): Promise<PublicNftItem[]> {
  try {
    return await getPublicNftsImpl();
  } catch {
    return [];
  }
}