import type { Metadata } from "next";
import PublicReviewForm from "@/components/testimonials/PublicReviewForm";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { getPublicTestimonials } from "@/lib/server/testimonials";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Testimonials | HM Visuals",
  description:
    "Client reviews and creative collaborations with HM Visuals across portraits, weddings, events, films, fashion, dance, and editorial visual work.",
};

function renderStars(value: number) {
  const rounded = Math.round(value);
  return Array.from({ length: 5 }, (_, index) =>
    index < rounded ? "★" : "☆",
  ).join("");
}

export default async function TestimonialsPage() {
  const data = await getPublicTestimonials(60);

  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-5 lg:pb-20 lg:pt-6">
        <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-muted/20 shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-border/60 lg:block" />

              <div className="max-w-3xl">
                <h1 className="text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-4xl lg:text-5xl">
                  What people say about me
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Real feedback from shoots, films, events, classes, and
                  creative collaborations.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-background px-3 py-1.5">
                  Photography
                </span>
                <span className="rounded-full border border-border/60 bg-background px-3 py-1.5">
                  Videography
                </span>
                <span className="rounded-full border border-border/60 bg-background px-3 py-1.5">
                  Creative direction
                </span>
              </div>
            </div>

            <aside className="bg-background/70 p-5 sm:p-6 lg:p-7">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] border border-border/60 bg-muted/20 p-4">
                  <div className="text-3xl font-semibold tracking-[-0.07em]">
                    {data.averageRating.toFixed(1)}
                  </div>
                  <div className="mt-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Average
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-border/60 bg-muted/20 p-4">
                  <div className="text-3xl font-semibold tracking-[-0.07em]">
                    {data.totalReviews}
                  </div>
                  <div className="mt-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Reviews
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[1.25rem] border border-border/60 bg-muted/20 p-4">
                <div className="text-lg tracking-[0.08em] text-amber-500">
                  {renderStars(data.averageRating)}
                </div>

                <div className="mt-4">
                  <PublicReviewForm triggerOnly />
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="mt-7 sm:mt-8">
          {data.items.length > 0 ? (
            <TestimonialsSection items={data.items} />
          ) : (
            <PortfolioFallbackPanel
              title="Client trust is built through clear direction and strong delivery."
              text="Photography, film, dance, and creative work shaped around the people and moments in front of the camera."
              items={[
                {
                  title: "Portraits",
                  text: "People-focused work with atmosphere, confidence, and emotional clarity.",
                },
                {
                  title: "Events",
                  text: "Coverage built around timing, story, movement, and a strong final selection.",
                },
                {
                  title: "Creative work",
                  text: "Collaborations with artists, performers, brands, and personal projects.",
                },
              ]}
              links={[
                { href: "/photography", label: "View work" },
                { href: "/contact", label: "Book", primary: true },
              ]}
            />
          )}
        </div>
      </section>
    </main>
  );
}
