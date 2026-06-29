import type { PublicMediaItem } from "@/lib/server/media-serializers";
import { PortfolioCard } from "@/components/shared/PortfolioCard";

function firstImage(items: PublicMediaItem[]) {
  return items.find((item) => item.secureUrl) ?? null;
}

export function HomeFeaturedWork({
  photos,
  videos,
}: {
  photos: PublicMediaItem[];
  videos: PublicMediaItem[];
}) {
  const photoImage = firstImage(photos);
  const videoImage = firstImage(videos);

  return (
    <section className="section-shell grid gap-5 py-8 lg:grid-cols-2">
      <PortfolioCard
        href="/photography"
        title="Photography with cinematic presence."
        description="Portraits, fashion, weddings, events, and editorial visual stories."
        imageUrl={photoImage?.secureUrl}
      />

      <PortfolioCard
        href="/videography"
        title="Film work shaped by motion and rhythm."
        description="Dance, events, fashion films, weddings, festivals, and atmosphere-led stories."
        imageUrl={videoImage?.secureUrl}
      />
    </section>
  );
}
