import type { Metadata } from "next";
import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("about");
  return { title: seo.title, description: seo.description };
}

const DISCIPLINE_ORDER = ["photography", "videography", "nft", "dancing", "web-development"];

export default async function AboutPage() {
  const [pageSettings, seo, sections] = await Promise.all([
    getAllPageSettings(),
    getPageSeo("about"),
    getPageSections("about"),
  ]);
  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));
  const firstActiveSlug = DISCIPLINE_ORDER.find((s) => activeSet.has(s));
  const workHref = firstActiveSlug ? `/${firstActiveSlug}` : null;

  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <PageHeader
            title={seo.headerTitle}
            description={seo.headerDescription}
            titleClassName="max-w-4xl lg:text-6xl"
          />

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {sections.creativePosition.label}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {sections.creativePosition.paragraph}
            </p>
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.disciplines.map((item, i) => (
            <article
              key={i}
              className="rounded-[2rem] border bg-background/60 p-5 shadow-sm backdrop-blur"
            >
              <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {sections.approach.label}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              {sections.approach.heading}
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {sections.approach.paragraph}
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {sections.principles.label}
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {sections.principles.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-14 rounded-[2rem] border bg-foreground p-6 text-background sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-background/65">
                {sections.closingCta.label}
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                {sections.closingCta.heading}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
                {sections.closingCta.paragraph}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {workHref && (
                <Link
                  href={workHref}
                  className="rounded-xl border border-background/30 px-4 py-2 text-sm transition-colors hover:bg-background/10"
                >
                  See the work
                </Link>
              )}
              <Link
                href="/contact"
                className="rounded-xl bg-background px-4 py-2 text-sm text-foreground transition-opacity hover:opacity-90"
              >
                Start a project
              </Link>
            </div>
          </div>
        </section>
      </main>

      <StickyCta />
    </>
  );
}