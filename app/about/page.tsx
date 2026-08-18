import type { Metadata } from "next";
import { AboutDisciplineCard } from "@/components/about/AboutDisciplineCard";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";

const DISCIPLINE_HREFS = ["/photography", "/videography", "/nft", "/dancing"];

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
      <main>
        <section className="section-shell pt-12 sm:pt-16">
          <PageHeader
            title={seo.headerTitle}
            description={seo.headerDescription}
            className="max-w-3xl"
          />
        </section>

        {sections.disciplines.length > 0 && (
          <section className="section-shell border-t border-border pb-28 pt-12 sm:pb-32 sm:pt-16">
            <div className="grid gap-5 lg:grid-cols-2">
              {sections.disciplines.map((card, i) => (
                <AboutDisciplineCard
                  key={i}
                  card={card}
                  href={DISCIPLINE_HREFS[i]}
                  priority={i === 0}
                  className={i === 0 ? "lg:col-span-2" : undefined}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <StickyCta
        title={sections.stickyCta.title}
        description={sections.stickyCta.description}
        buttonLabel={sections.stickyCta.buttonLabel}
      />
    </>
  );
}
