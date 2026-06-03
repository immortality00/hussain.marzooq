import Image from "next/image";
import Link from "next/link";
import type { PublicMediaItem } from "@/lib/server/media-serializers";

function firstImage(items: PublicMediaItem[]) {
  return items.find((item) => item.secureUrl) ?? null;
}

function FeatureLink({
  href,
  label,
  title,
  imageUrl,
}: {
  href: string;
  label: string;
  title: string;
  imageUrl?: string | null;
}) {
  return (
    <Link
      href={href}
      className="group relative min-h-[22rem] overflow-hidden rounded-[2rem] border bg-muted shadow-sm"
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.55),transparent_30%),linear-gradient(135deg,var(--muted),var(--background))]" />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <div className="text-xs uppercase tracking-[0.22em] text-white/65">{label}</div>

        <h2 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight">{title}</h2>

        <div className="mt-5 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur transition group-hover:bg-white group-hover:text-black">
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
        label="Photography"
        title="Portraits, fashion, weddings, and editorial moments."
        imageUrl={photoImage?.secureUrl}
      />

      <FeatureLink
        href="/videography"
        label="Videography"
        title="Movement, events, fashion films, and showreel work."
        imageUrl={videoImage?.secureUrl}
      />
    </section>
  );
}