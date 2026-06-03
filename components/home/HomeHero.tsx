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
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
        <div>
          <div className="eyebrow">HM VISUALS / DUBAI + GLOBAL</div>

          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.075em] sm:text-6xl lg:text-7xl">
            Cinematic visual work for people, brands, movement, and digital culture.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Photography, filmmaking, NFT art, dance, and creative web work shaped into one premium
            visual portfolio.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/photography"
              className="rounded-full bg-foreground px-5 py-3 text-sm text-background hover:opacity-90"
            >
              See my work
            </Link>

            <Link
              href="/contact"
              className="rounded-full border px-5 py-3 text-sm hover:bg-accent"
            >
              Book a project
            </Link>
          </div>
        </div>

        <div className="relative min-h-[30rem] overflow-hidden rounded-[2.5rem] border bg-muted shadow-sm">
          {heroImage?.secureUrl ? (
            <Image
              src={heroImage.secureUrl}
              alt={heroImage.title || "Featured HM Visuals work"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.7),transparent_24%),linear-gradient(135deg,var(--background),var(--muted))]" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute bottom-0 p-6 text-white sm:p-8">
            <div className="text-xs uppercase tracking-[0.24em] text-white/60">
              Featured direction
            </div>

            <p className="mt-3 max-w-sm text-2xl font-semibold leading-tight tracking-tight">
              Minimal tools. High-end emotion. Visuals with atmosphere.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}