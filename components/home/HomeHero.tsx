import { AnimatedText } from "@/components/shared/AnimatedText";
import { HeroBokeh } from "@/components/home/HeroBokeh";
import { HeroStage } from "@/components/home/HeroStage";
import { heroSerif } from "@/components/home/hero-font";
import Link from "next/link";
import type { HeroPhoto } from "@/lib/hero-photos";

const DISCIPLINE_ORDER = ["photography", "videography", "nft", "dancing", "web-development"];

export function HomeHero({
  activeSet,
  photos,
  headerTitle,
  headerDescription,
}: {
  activeSet: Set<string>;
  photos: HeroPhoto[];
  headerTitle: string;
  headerDescription: string;
}) {
  // Admin-picked hero photos only — empty means empty, same as every other card
  // (no auto-pick fallback). The admin warns when a visible hero has no photo.
  const firstActiveSlug = DISCIPLINE_ORDER.find((s) => activeSet.has(s));
  const workHref = firstActiveSlug ? `/${firstActiveSlug}` : null;

  return (
    <HeroStage photos={photos}>
      {/* Cinematic dark overlay — heavy at bottom, light at top */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.55) 45%, rgba(10,8,6,0.18) 100%)",
        }}
      />

      {/* Three.js bokeh particle field */}
      <HeroBokeh />

      {/* Content — lower-third cinematic placement. Pointers pass through to the
          photo strips everywhere except the two buttons. */}
      <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end px-8 pb-16 sm:px-14 sm:pb-20 lg:px-20 lg:pb-24">
        <h1
          className={`${heroSerif.className} hm-hero-dim max-w-5xl text-[3.4rem] font-normal leading-[0.92] tracking-[-0.02em] text-white sm:text-[4.25rem] lg:text-[6.25rem]`}
        >
          <AnimatedText delay={0.15}>{headerTitle}</AnimatedText>
        </h1>

        <p className="hm-hero-dim mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
          {headerDescription}
        </p>

        <div className="hm-hero-actions mt-9 flex flex-wrap gap-3">
          {workHref && (
            <Link
              href={workHref}
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
            >
              See the work
            </Link>
          )}
          <Link
            href="/contact"
            className="rounded-full border border-white/30 px-6 py-3 text-sm text-white transition-colors hover:border-white hover:bg-white hover:text-black"
          >
            Book
          </Link>
        </div>
      </div>
    </HeroStage>
  );
}
