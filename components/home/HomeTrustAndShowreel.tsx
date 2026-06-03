import Link from "next/link";
import type { PublicTestimonial } from "@/lib/server/testimonials";

export function HomeTrustAndShowreel({
  testimonial,
  showreelUrl,
}: {
  testimonial: PublicTestimonial | null;
  showreelUrl: string | null;
}) {
  return (
    <section className="section-shell grid gap-5 pb-28 pt-8 sm:pb-32 lg:grid-cols-2">
      <div className="premium-panel p-6 sm:p-8">
        <div className="eyebrow">Trust</div>

        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Real feedback, approved and presented as part of the visual story.
        </h2>

        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          {testimonial
            ? `“${testimonial.review}”`
            : "Testimonials are being curated. New public reviews will appear after approval."}
        </p>

        <Link
          href="/testimonials"
          className="mt-7 inline-flex rounded-full border px-5 py-3 text-sm hover:bg-accent"
        >
          Read testimonials
        </Link>
      </div>

      <div className="premium-panel p-6 sm:p-8">
        <div className="eyebrow">Showreel</div>

        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Film and motion as a first-class part of the portfolio.
        </h2>

        <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
          {showreelUrl
            ? "The current showreel is connected and ready as the entry point into video work."
            : "The video page is prepared for a showreel-led presentation once the final reel is selected."}
        </p>

        <Link
          href="/videography#showreel"
          className="mt-7 inline-flex rounded-full border px-5 py-3 text-sm hover:bg-accent"
        >
          Watch videos
        </Link>
      </div>
    </section>
  );
}