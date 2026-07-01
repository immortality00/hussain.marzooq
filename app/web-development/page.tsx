import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSettings } from "@/lib/server/page-settings";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("web-development");
  return { title: seo.title, description: seo.description };
}

export default async function WebDevelopmentPage() {
  const [{ isActive }, seo, content] = await Promise.all([
    getPageSettings("web-development"),
    getPageSeo("web-development"),
    getPageSections("web-development"),
  ]);
  if (!isActive) redirect("/");
  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <PageHeader
            title={seo.headerTitle}
            description={seo.headerDescription}
          />

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {content.creativeTechnology.label}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {content.creativeTechnology.paragraph}
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {content.capabilities.map((item, i) => (
            <article
              key={i}
              className="rounded-[2rem] border bg-background/60 p-5 shadow-sm backdrop-blur"
            >
              <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {content.technicalDirection.label}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              {content.technicalDirection.heading}
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {content.technicalDirection.paragraph}
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {content.buildPrinciples.label}
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {content.buildPrinciples.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] border bg-foreground p-6 text-background sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-background/65">
                {content.closingCta.label}
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                {content.closingCta.heading}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
                {content.closingCta.paragraph}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/services"
                className="rounded-xl border border-background/30 px-4 py-2 text-sm transition-colors hover:bg-background/10"
              >
                View services
              </Link>
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