import { noStoreJson } from "@/app/api/_lib/common";
import { getAllPageSettings } from "@/lib/server/page-settings";

export const dynamic = "force-dynamic";

const DISCIPLINES = [
  { slug: "photography", label: "Photography", href: "/photography" },
  { slug: "videography", label: "Videography", href: "/videography" },
  { slug: "nft", label: "NFT", href: "/nft" },
  { slug: "dancing", label: "Dancing", href: "/dancing" },
  { slug: "web-development", label: "Web Development", href: "/web-development" },
] as const;

export async function GET() {
  const pageSettings = await getAllPageSettings();
  const settingsBySlug = new Map(pageSettings.map((p) => [p.slug, p]));

  // The card image is admin-controlled per discipline (Work layout image). Empty
  // means no image — there is no auto-pick fallback.
  const cards = DISCIPLINES.filter(({ slug }) => settingsBySlug.get(slug)?.isActive).map(
    ({ slug, label, href }) => ({
      slug,
      label,
      href,
      imageUrl: settingsBySlug.get(slug)?.cardImage.url || null,
    }),
  );

  return noStoreJson(cards);
}
