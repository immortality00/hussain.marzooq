import PublicReviewForm from "@/components/testimonials/PublicReviewForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <section className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Leave a review</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
          A simple review form for clients and collaborators who want to share their experience.
        </p>
      </section>

      <div className="mt-10">
        <PublicReviewForm />
      </div>
    </main>
  );
}