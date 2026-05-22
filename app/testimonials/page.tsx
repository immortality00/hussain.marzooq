import type { Metadata } from "next";
import PublicReviewForm from "@/components/testimonials/PublicReviewForm";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import { getPublicTestimonials } from "@/lib/server/testimonials";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Testimonials | HM Visuals",
  description:
    "Client reviews and creative collaborations with HM Visuals across portraits, weddings, events, films, fashion, dance, and editorial visual work.",
};

function renderStars(value: number) {
  const rounded = Math.round(value);
  return Array.from({ length: 5 }, (_, index) => (index < rounded ? "★" : "☆")).join("");
}

export default async function TestimonialsPage() {
  const data = await getPublicTestimonials(60);

  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:pb-20 lg:pt-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <h1 className="max-w-3xl text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              What people say about me
            </h1>
          </div>

          <aside className="rounded-[1.5rem] border border-border/60 bg-muted/25 p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-4xl font-semibold tracking-[-0.07em]">
                  {data.averageRating.toFixed(1)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Average rating</div>
              </div>

              <div>
                <div className="text-4xl font-semibold tracking-[-0.07em]">
                  {data.totalReviews}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Reviews</div>
              </div>
            </div>

            <div className="mt-5 text-xl tracking-[0.08em] text-amber-500">
              {renderStars(data.averageRating)}
            </div>

            <div className="mt-5">
              <PublicReviewForm triggerOnly />
            </div>
          </aside>
        </div>

        <div className="mt-8 sm:mt-10">
          {data.items.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/60 bg-muted/25 p-8 text-sm text-muted-foreground">
              No approved public reviews yet.
            </div>
          ) : (
            <TestimonialsSection items={data.items} />
          )}
        </div>
      </section>
    </main>
  );
}