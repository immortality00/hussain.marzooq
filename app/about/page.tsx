import type { Metadata } from "next";
import { AboutDisciplineCard } from "@/components/about/AboutDisciplineCard";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import { getPageSections } from "@/lib/server/page-sections";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { DISCIPLINE_HREF, type DisciplineSlug } from "@/lib/disciplines";

const LEGACY_SLUGS: DisciplineSlug[] = ["photography", "videography", "nft", "dancing"];

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("about");
  return buildPublicMetadata({
    title: seo.title,
    description: seo.description,
    path: "/about",
    image: seo.ogImageUrl,
  });
}

export default async function AboutPage() {
  const [seo, sections, pageSettings] = await Promise.all([
    getPageSeo("about"),
    getPageSections("about"),
    getAllPageSettings(),
  ]);

  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));

  const cards = sections.disciplines
    .map((card, i) => ({ card, slug: card.slug ?? LEGACY_SLUGS[i] }))
    .filter(({ slug }) => !slug || activeSet.has(slug));

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

        {cards.length > 0 && (
          <section className="section-shell border-t border-border pb-28 pt-12 sm:pb-32 sm:pt-16">
            <div className="grid gap-5 lg:grid-cols-2">
              {cards.map(({ card, slug }, i) => (
                <AboutDisciplineCard
                  key={i}
                  card={card}
                  href={slug ? DISCIPLINE_HREF[slug] : undefined}
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
