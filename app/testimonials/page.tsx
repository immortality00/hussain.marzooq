import PublicReviewForm from "@/components/testimonials/PublicReviewForm";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import { getPublicTestimonials } from "@/lib/server/testimonials";

function renderStars(value: number) {
  const rounded = Math.round(value);
  return Array.from({ length: 5 }, (_, index) => (index < rounded ? "★" : "☆")).join("");
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TestimonialsPage() {
  const data = await getPublicTestimonials(60);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="grid gap-10 xl:grid-cols-[minmax(0,1.58fr)_270px] xl:gap-8">
        <div className="min-w-0">
          <header className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Real client feedback
            </div>

            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl xl:text-7xl">
              Testimonials
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Reviews from clients and collaborators across portrait sessions,
              fashion work, weddings, events, and creative projects.
            </p>
          </header>

          <div className="mt-10">
            {data.items.length === 0 ? (
              <div className="rounded-[2rem] bg-background/70 p-8 ring-1 ring-border/50">
                <p className="text-sm text-muted-foreground">
                  No approved public reviews yet.
                </p>
              </div>
            ) : (
              <TestimonialsSection items={data.items} />
            )}
          </div>
        </div>

        <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[1.5rem] bg-background/75 p-4 backdrop-blur-sm ring-1 ring-border/50">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Average rating
            </div>

            <div className="mt-4 flex items-end gap-3">
              <div className="text-3xl font-semibold tracking-[-0.04em]">
                {data.averageRating.toFixed(1)}
              </div>
              <div className="pb-1 text-lg text-amber-400">
                {renderStars(data.averageRating)}
              </div>
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              Based on {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}.
            </div>
          </section>

          <section className="rounded-[1.5rem] bg-background/75 p-4 backdrop-blur-sm ring-1 ring-border/50">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Leave a review
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Share your experience with stars, a review, and optional photos.
            </p>

            <div className="mt-4">
              <PublicReviewForm triggerOnly />
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}