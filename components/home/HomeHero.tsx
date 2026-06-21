import Image from "next/image";
import Link from "next/link";
import type { PublicMediaItem } from "@/lib/server/media-serializers";

function firstImage(items: PublicMediaItem[]) {
  return items.find((item) => item.secureUrl) ?? null;
}

export function HomeHero({
  photos,
  videos,
}: {
  photos: PublicMediaItem[];
  videos: PublicMediaItem[];
}) {
  const heroImage = firstImage(photos) ?? firstImage(videos);

  return (
    <section className="section-shell py-12 sm:py-16 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <h1 className="max-w-5xl text-balance text-5xl font-semibold leading-[0.92] tracking-[-0.08em] sm:text-6xl lg:text-7xl">
            Cinematic visual direction for people, movement, fashion, weddings, and digital culture.
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Photography, film, dance, NFT work, and creative web systems shaped with atmosphere,
            precision, and a high-end visual language.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/photography"
              className="rounded-full bg-foreground px-5 py-3 text-sm text-background hover:opacity-90"
            >
              See the work
            </Link>

            <Link
              href="/contact"
              className="rounded-full border px-5 py-3 text-sm hover:bg-accent"
            >
              Book
            </Link>
          </div>
        </div>

        <div className="relative min-h-[34rem] overflow-hidden rounded-[2.75rem] border bg-muted shadow-sm">
          {heroImage?.secureUrl ? (
            <Image
              src={heroImage.secureUrl}
              alt={heroImage.title || "HM Visuals work"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.68),transparent_26%),radial-gradient(circle_at_76%_78%,rgba(255,255,255,0.34),transparent_24%),linear-gradient(135deg,var(--muted),var(--background))]" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/76 via-black/12 to-transparent" />

          <div className="absolute bottom-0 p-6 text-white sm:p-8">
            <p className="max-w-sm text-3xl font-semibold leading-[1.02] tracking-[-0.04em]">
              Emotion, rhythm, and atmosphere built into every frame.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}