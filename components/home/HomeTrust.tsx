import Link from "next/link";
import type { PublicTestimonial } from "@/lib/server/testimonials";
import type { HomeSections } from "@/lib/server/page-sections";
import { HomeTestimonialCard } from "./HomeTestimonialCard";

export function HomeTrust({
  testimonials,
  content,
}: {
  testimonials: PublicTestimonial[];
  content: HomeSections["trust"];
}) {
  return (
    <section className="section-shell pb-28 pt-8 sm:pb-32">
      <div className="premium-panel p-6 sm:p-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{content.heading}</h2>

        {testimonials.length > 0 ? (
          <div className="mt-6">
            <HomeTestimonialCard items={testimonials} />
          </div>
        ) : (
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {content.fallbackParagraph}
          </p>
        )}

        <Link
          href="/testimonials"
          className="mt-7 inline-flex rounded-full border px-5 py-3 text-sm hover:bg-accent"
        >
          Read testimonials
        </Link>
      </div>
    </section>
  );
}
