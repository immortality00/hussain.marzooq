import type { PublicMediaItem } from "@/lib/server/media-serializers";
import type { HomeSections } from "@/lib/server/page-sections";
import { PortfolioCard } from "@/components/shared/PortfolioCard";

function firstImage(items: PublicMediaItem[]) {
  return items.find((item) => item.secureUrl) ?? null;
}

export function HomeFeaturedWork({
  photos,
  videos,
  activeSet,
  content,
}: {
  photos: PublicMediaItem[];
  videos: PublicMediaItem[];
  activeSet: Set<string>;
  content: HomeSections["featuredWork"];
}) {
  const photoImage = firstImage(photos);
  const videoImage = firstImage(videos);

  const showPhoto = activeSet.has("photography");
  const showVideo = activeSet.has("videography");

  if (!showPhoto && !showVideo) return null;

  return (
    <section className="section-shell grid gap-5 py-8 lg:grid-cols-2">
      {showPhoto && (
        <PortfolioCard
          href="/photography"
          title={content.photography.title}
          description={content.photography.description}
          imageUrl={photoImage?.secureUrl}
        />
      )}
      {showVideo && (
        <PortfolioCard
          href="/videography"
          title={content.film.title}
          description={content.film.description}
          imageUrl={videoImage?.secureUrl}
        />
      )}
    </section>
  );
}
