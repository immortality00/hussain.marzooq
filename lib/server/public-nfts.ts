import clientPromise from "@/lib/mongodb";

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
  appearances: Array<{
    kind: "featured" | "exhibited";
    title: string;
    venue: string;
    city: string;
    country: string;
    dateFrom: string;
    dateTo: string;
    notes: string;
    link: string;
  }>;
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

export async function getPublicNfts(): Promise<PublicNftItem[]> {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

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
      tags: Array.isArray(d.tags) ? d.tags.filter((x) => typeof x === "string") : [],
      people: Array.isArray(d.people) ? d.people.filter((x) => typeof x === "string") : [],
      categories: Array.isArray(d.categories) ? d.categories.filter((x) => typeof x === "string") : [],
      appearances: Array.isArray(d.appearances)
        ? d.appearances.filter((x): x is PublicNftItem["appearances"][number] => typeof x === "object" && x !== null)
        : [],
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
                d.nft.editionType === "limited" || d.nft.editionType === "open" ? d.nft.editionType : "1/1",
              editionsTotal:
                typeof d.nft.editionsTotal === "number" ? d.nft.editionsTotal : null,
              editionsRemaining:
                typeof d.nft.editionsRemaining === "number" ? d.nft.editionsRemaining : null,
              openUntil: typeof d.nft.openUntil === "string" ? d.nft.openUntil : null,
              status:
                d.nft.status === "sold" || d.nft.status === "coming-soon" ? d.nft.status : "available",
              marketplaceUrl: typeof d.nft.marketplaceUrl === "string" ? d.nft.marketplaceUrl : null,
            }
          : null,
    }))
    .filter((item): item is PublicNftItem => !!item.nft);
}