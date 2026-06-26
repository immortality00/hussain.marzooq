import SmartImage from "@/components/shared/SmartImage";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { HeroBokeh } from "@/components/home/HeroBokeh";
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
    <section className="relative h-svh min-h-[600px] overflow-hidden bg-[#1a1814]">
      {/* Background image */}
      {heroImage?.secureUrl && (
        <SmartImage
          src={heroImage.secureUrl}
          alt={heroImage.title || "HM Visuals"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center z-0"
        />
      )}

      {/* Cinematic dark overlay — heavy at bottom, light at top */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.55) 45%, rgba(10,8,6,0.18) 100%)",
        }}
      />

      {/* Three.js bokeh particle field */}
      <HeroBokeh />

      {/* Content — lower-third cinematic placement */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end px-8 pb-16 sm:px-14 sm:pb-20 lg:px-20 lg:pb-24">
        <h1 className="max-w-5xl text-5xl font-semibold leading-[0.9] tracking-[-0.07em] text-white sm:text-6xl lg:text-[5.5rem]">
          <AnimatedText delay={0.15}>
            Cinematic visual direction for people, movement, fashion, weddings, and digital culture.
          </AnimatedText>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
          Photography, film, dance, NFT work, and creative web systems shaped
          with atmosphere, precision, and a high-end visual language.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/photography"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-85"
          >
            See the work
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white/30 px-6 py-3 text-sm text-white transition-colors hover:bg-white/10"
          >
            Book
          </Link>
        </div>
      </div>
    </section>
  );
}
