import type { Metadata } from "next";
import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { getPageSeo } from "@/lib/server/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("blog");
  return { title: seo.title, description: seo.description };
}

const pillars = [
  {
    title: "Portraits",
    description:
      "Thoughtful portrait direction, cinematic framing, and visual storytelling around people.",
  },
  {
    title: "Fashion",
    description:
      "Editorial styling, movement, mood, and image construction for strong visual identity.",
  },
  {
    title: "Weddings",
    description: "Emotion-led coverage with a premium and artistic point of view.",
  },
  {
    title: "Film",
    description: "Cinematic shooting, visual pacing, and stronger moving-image work.",
  },
];

export default async function BlogPage() {
  const [pageSettings, seo] = await Promise.all([
    getAllPageSettings(),
    getPageSeo("blog"),
  ]);
  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));

  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <PageHeader title={seo.headerTitle} description={seo.headerDescription} />

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Editorial direction
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A focused space for stories behind the work, creative decisions, locations, movement,
              atmosphere, and visual identity.
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

        <section className="mt-12 rounded-[2rem] border bg-background/60 p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Explore the work
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {activeSet.has("photography") && (
              <Link
                href="/photography"
                className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
              >
                Photography
              </Link>
            )}
            {activeSet.has("videography") && (
              <Link
                href="/videography"
                className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
              >
                Videography
              </Link>
            )}
            <Link
              href="/contact"
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
            >
              Book
            </Link>
          </div>
        </section>
      </main>

      <StickyCta />
    </>
  );
}