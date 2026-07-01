import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSettings, getAllPageSettings } from "@/lib/server/page-settings";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("dancing");
  return { title: seo.title, description: seo.description };
}

export default async function DancingPage() {
  const [{ isActive }, allSettings, seo, content] = await Promise.all([
    getPageSettings("dancing"),
    getAllPageSettings(),
    getPageSeo("dancing"),
    getPageSections("dancing"),
  ]);
  if (!isActive) redirect("/");
  const activeSet = new Set(allSettings.filter((p) => p.isActive).map((p) => p.slug));
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
              {content.movementLanguage.label}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {content.movementLanguage.paragraph}
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {content.sections.map((item, i) => (
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
              {content.direction.label}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              {content.direction.heading}
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {content.direction.paragraph}
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {content.workCovered.label}
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {content.workCovered.items.map((item, i) => (
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
              {activeSet.has("videography") && (
                <Link
                  href="/videography"
                  className="rounded-xl border border-background/30 px-4 py-2 text-sm transition-colors hover:bg-background/10"
                >
                  View video work
                </Link>
              )}
              <Link
                href="/contact?category=dance"
                className="rounded-xl bg-background px-4 py-2 text-sm text-foreground transition-opacity hover:opacity-90"
              >
                Book or collaborate
              </Link>
            </div>
          </div>
        </section>
      </main>

      <StickyCta />
    </>
  );
}