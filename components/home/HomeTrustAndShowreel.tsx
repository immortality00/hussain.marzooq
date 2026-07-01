import Link from "next/link";
import type { PublicTestimonial } from "@/lib/server/testimonials";
import type { HomeSections } from "@/lib/server/page-sections";
import { toEmbedUrl } from "@/components/media/utils";

export function HomeTrustAndShowreel({
  testimonial,
  showreelUrl,
  activeSet,
  content,
}: {
  testimonial: PublicTestimonial | null;
  showreelUrl: string | null;
  activeSet: Set<string>;
  content: Pick<HomeSections, "trust" | "showreel">;
}) {
  const showreelEmbed = showreelUrl ? toEmbedUrl(showreelUrl) : null;
  const showreelVideo = showreelUrl && !showreelEmbed ? showreelUrl : null;

  return (
    <section className={`section-shell grid gap-5 pb-28 pt-8 sm:pb-32 ${activeSet.has("videography") ? "lg:grid-cols-2" : ""}`}>
      <div className="premium-panel p-6 sm:p-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{content.trust.heading}</h2>

        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {testimonial ? `“${testimonial.review}”` : content.trust.fallbackParagraph}
        </p>

        <Link
          href="/testimonials"
          className="mt-7 inline-flex rounded-full border px-5 py-3 text-sm hover:bg-accent"
        >
          Read testimonials
        </Link>
      </div>

      {activeSet.has("videography") && (
      <div className="overflow-hidden rounded-[2rem] border bg-muted shadow-sm">
        <div className="aspect-video bg-black">
          {showreelEmbed ? (
            <iframe
              className="h-full w-full"
              src={showreelEmbed}
              title="Showreel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : showreelVideo ? (
            <video
              className="h-full w-full"
              controls
              playsInline
              preload="metadata"
              src={showreelVideo}
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {content.showreel.heading}
          </h2>

          <Link
            href="/videography#showreel"
            className="mt-7 inline-flex rounded-full border px-5 py-3 text-sm hover:bg-accent"
          >
            Watch videos
          </Link>
        </div>
      </div>
      )}
    </section>
  );
}