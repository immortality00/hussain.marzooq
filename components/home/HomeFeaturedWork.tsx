import type { PublicMediaItem } from "@/lib/server/media-serializers";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import type { FeaturedCard, FeaturedCardSlug } from "@/lib/server/page-sections";
import { PortfolioCard } from "@/components/shared/PortfolioCard";

const CTA_LABELS: Partial<Record<FeaturedCardSlug, string>> = {
  nft: "View collection",
};

function firstImage(items: PublicMediaItem[]) {
  return items.find((item) => item.secureUrl)?.secureUrl ?? null;
}

export function HomeFeaturedWork({
  photos,
  videos,
  nfts,
  activeSet,
  cards,
}: {
  photos: PublicMediaItem[];
  videos: PublicMediaItem[];
  nfts: PublicNftItem[];
  activeSet: Set<string>;
  cards: FeaturedCard[];
}) {
  const imageBySlug: Partial<Record<FeaturedCardSlug, string | null>> = {
    photography: firstImage(photos),
    videography: firstImage(videos),
    nft: nfts.find((item) => item.mediaUrl)?.mediaUrl ?? null,
  };

  const visibleCards = cards.filter((card) => activeSet.has(card.slug));

  if (visibleCards.length === 0) return null;

  const lastSpansBoth = visibleCards.length % 2 === 1;

  return (
    <section className="section-shell grid gap-5 py-8 lg:grid-cols-2">
      {visibleCards.map((card, index) => (
        <PortfolioCard
          key={`${card.slug}-${index}`}
          href={`/${card.slug}`}
          title={card.title}
          description={card.description || undefined}
          imageUrl={imageBySlug[card.slug]}
          ctaLabel={CTA_LABELS[card.slug]}
          className={lastSpansBoth && index === visibleCards.length - 1 ? "lg:col-span-2" : undefined}
        />
      ))}
    </section>
  );
}
