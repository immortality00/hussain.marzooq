import SmartImage from "@/components/shared/SmartImage";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { HeroBokeh } from "@/components/home/HeroBokeh";
import Link from "next/link";
import type { SectionImage } from "@/lib/server/page-sections";

const DISCIPLINE_ORDER = ["photography", "videography", "nft", "dancing", "web-development"];

export function HomeHero({
  activeSet,
  heroImage,
  headerTitle,
  headerDescription,
}: {
  activeSet: Set<string>;
  heroImage: SectionImage;
  headerTitle: string;
  headerDescription: string;
}) {
  // Admin-picked hero image only — empty means empty, same as every other card
  // (no auto-pick fallback). The admin warns when a visible hero has no image.
  const heroImageUrl = heroImage?.url || null;
  const firstActiveSlug = DISCIPLINE_ORDER.find((s) => activeSet.has(s));
  const workHref = firstActiveSlug ? `/${firstActiveSlug}` : null;

  return (
    <section className="relative h-svh min-h-[600px] overflow-hidden bg-background">
      {/* Background image — flat bg-muted when empty, never a broken frame */}
      {heroImageUrl ? (
        <SmartImage
          src={heroImageUrl}
          alt="HM Visuals"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center z-0"
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-muted" />
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
          <AnimatedText delay={0.15}>{headerTitle}</AnimatedText>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
          {headerDescription}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          {workHref && (
            <Link
              href={workHref}
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-85"
            >
              See the work
            </Link>
          )}
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
