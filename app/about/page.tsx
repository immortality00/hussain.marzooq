import type { Metadata } from "next";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("about");
  return { title: seo.title, description: seo.description };
}

export default async function AboutPage() {
  const [seo, sections] = await Promise.all([
    getPageSeo("about"),
    getPageSections("about"),
  ]);

  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <PageHeader
          title={seo.headerTitle}
          description={seo.headerDescription}
          className="max-w-4xl"
          titleClassName="lg:text-6xl"
        />

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
      </main>

      <StickyCta
        title={sections.stickyCta.title}
        description={sections.stickyCta.description}
        buttonLabel={sections.stickyCta.buttonLabel}
      />
    </>
  );
}
