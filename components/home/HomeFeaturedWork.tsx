import Image from "next/image";
import Link from "next/link";
import type { PublicMediaItem } from "@/lib/server/media-serializers";

function firstImage(items: PublicMediaItem[]) {
  return items.find((item) => item.secureUrl) ?? null;
}

function FeatureLink({
  href,
  title,
  text,
  imageUrl,
}: {
  href: string;
  title: string;
  text: string;
  imageUrl?: string | null;
}) {
  return (
    <Link
      href={href}
      className="group relative min-h-[25rem] overflow-hidden rounded-[2.25rem] border bg-muted shadow-sm"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.6),transparent_30%),linear-gradient(135deg,var(--muted),var(--background))]" />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/82 via-black/24 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
        <h2 className="max-w-lg text-3xl font-semibold leading-[1.02] tracking-[-0.045em]">
          {title}
        </h2>

        <p className="mt-4 max-w-md text-sm leading-6 text-white/70">{text}</p>

        <div className="mt-6 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur transition group-hover:bg-white group-hover:text-black">
          Explore
        </div>
      </div>
    </Link>
  );
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
      <FeatureLink
        href="/photography"
        title="Photography with cinematic presence."
        text="Portraits, fashion, weddings, events, and editorial visual stories."
        imageUrl={photoImage?.secureUrl}
      />

      <FeatureLink
        href="/videography"
        title="Film work shaped by motion and rhythm."
        text="Dance, events, fashion films, weddings, festivals, and atmosphere-led stories."
        imageUrl={videoImage?.secureUrl}
      />
    </section>
  );
}