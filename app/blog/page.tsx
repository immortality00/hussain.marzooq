import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";

const pillars = [
  {
    title: "Portraits",
    description: "Thoughtful portrait direction, cinematic framing, and visual storytelling around people.",
  },
  {
    title: "Fashion",
    description: "Editorial styling, movement, mood, and image construction for strong visual identity.",
  },
  {
    title: "Weddings",
    description: "Emotion-led coverage with a premium and artistic point of view.",
  },
  {
    title: "Film",
    description: "Cinematic shooting, visual pacing, and the craft behind stronger moving-image work.",
  },
];

export default function BlogPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border px-3 py-1 text-[11px] tracking-[0.16em] text-muted-foreground">
              JOURNAL
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Blog</h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              A space for visual essays, creative process, and long-form writing around photography, film,
              movement, and image-making.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Direction
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This section will become the editorial layer of the portfolio: stronger context, better SEO,
              and a clearer point of view behind the work.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((item) => (
            <article key={item.title} className="rounded-[2rem] border bg-background/60 p-5">
              <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              What will appear here
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>Creative breakdowns and behind-the-scenes thinking</li>
              <li>Location, styling, and visual direction notes</li>
              <li>Articles that support service discovery and public search visibility</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              In the meantime
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/photography"
                className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Explore photography
              </Link>
              <Link
                href="/videography"
                className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Explore videography
              </Link>
              <Link
                href="/contact"
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
              >
                Book
              </Link>
            </div>
          </div>
        </section>
      </main>

      <StickyCta />
    </>
  );
}