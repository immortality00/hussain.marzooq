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
    <main className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
        <div className="min-w-0">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Testimonials</h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Reviews from clients and collaborators across portraits, fashion, weddings, events, and creative work.
          </p>

          {data.items.length === 0 ? (
            <div className="mt-8 rounded-[2rem] border p-8 text-sm text-muted-foreground">
              No approved public reviews yet.
            </div>
          ) : (
            <div className="mt-8">
              <TestimonialsSection items={data.items} />
            </div>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className="rounded-[2rem] border bg-background/70 p-5">
            <div className="text-sm font-medium text-muted-foreground">Average rating</div>

            <div className="mt-4 flex items-end gap-3">
              <div className="text-4xl font-semibold">{data.averageRating.toFixed(1)}</div>
              <div className="pb-1 text-2xl text-amber-400">{renderStars(data.averageRating)}</div>
            </div>

            <div className="mt-3 text-sm text-muted-foreground">
              Based on {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}.
            </div>
          </section>

          <section className="rounded-[2rem] border bg-background/70 p-5">
            <div className="text-lg font-semibold tracking-tight">Leave a review</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Share your experience with stars, a review, and optional photos.
            </p>

            <div className="mt-5">
              <PublicReviewForm triggerOnly />
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}