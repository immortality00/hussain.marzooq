import { noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";
import { buildPublicMediaQuery } from "@/lib/server/media-serializers";

export const dynamic = "force-dynamic";

const DISCIPLINES = [
  { slug: "photography", label: "Photography", href: "/photography", category: "photography" },
  { slug: "videography", label: "Videography", href: "/videography", category: "videography" },
  { slug: "nft", label: "NFT", href: "/nft", category: "nft" },
  { slug: "dancing", label: "Dancing", href: "/dancing", category: null },
  { slug: "web-development", label: "Web Development", href: "/web-development", category: null },
] as const;

export async function GET() {
  const db = await getDb();

  const cards = await Promise.all(
    DISCIPLINES.map(async ({ slug, label, href, category }) => {
      let imageUrl: string | null = null;

      if (category) {
        const doc = await db
          .collection("media")
          .findOne(
            { ...buildPublicMediaQuery({ type: "image", category }), secureUrl: { $exists: true, $ne: null } },
            { projection: { "asset.secureUrl": 1, secureUrl: 1 }, sort: { createdAt: -1 } },
          );

        if (doc) {
          const asset = doc.asset as Record<string, unknown> | undefined;
          imageUrl =
            (typeof asset?.secureUrl === "string" ? asset.secureUrl : null) ??
            (typeof doc.secureUrl === "string" ? doc.secureUrl : null);
        }
      }

      return { slug, label, href, imageUrl };
    }),
  );

  return noStoreJson(cards);
}
