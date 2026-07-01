import type { Metadata } from "next";
import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("blog");
  return { title: seo.title, description: seo.description };
}

export default async function BlogPage() {
  const [pageSettings, seo, content] = await Promise.all([
    getAllPageSettings(),
    getPageSeo("blog"),
    getPageSections("blog"),
  ]);
  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));

  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <PageHeader title={seo.headerTitle} description={seo.headerDescription} />

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {content.editorialDirection.label}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {content.editorialDirection.paragraph}
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {content.pillars.map((item, i) => (
            <article key={i} className="rounded-[2rem] border bg-background/60 p-5">
              <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
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