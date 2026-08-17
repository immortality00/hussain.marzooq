import type { PublicTestimonial } from "@/lib/server/testimonials";
import type { HomeSections } from "@/lib/server/page-sections";
import { Button } from "@/components/shared/Button";
import { HomeTestimonialCard } from "./HomeTestimonialCard";

export function HomeTrust({
  testimonials,
  content,
}: {
  testimonials: PublicTestimonial[];
  content: HomeSections["trust"];
}) {
  // Last section before the fixed StickyCta — keeps a generous bottom padding
  // so the sticky bar never covers content (the "last section = pb-12" ideal in
  // CLAUDE.md yields to that constraint here). The premium-panel wrapper was
  // removed in D2b (second card-in-card).
  return (
    <section className="section-shell border-t border-border pb-28 pt-12 sm:pb-32 sm:pt-16">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{content.heading}</h2>

      {testimonials.length > 0 ? (
        <div className="mt-8">
          <HomeTestimonialCard items={testimonials} />
        </div>
      ) : (
        <p className="mt-8 text-lg leading-8 text-muted-foreground">
          {content.fallbackParagraph}
        </p>
      )}

      <Button href="/testimonials" className="mt-7">
        Read testimonials
      </Button>
    </section>
  );
}
