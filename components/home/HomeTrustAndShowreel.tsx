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
            : "Photography, film, and creative direction built around clear communication, trust, and a strong final result."}
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
            ? "Cinematic movement, events, fashion, and visual rhythm shaped into a focused video experience."
            : "Video work shaped around movement, atmosphere, rhythm, and strong visual direction."}
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