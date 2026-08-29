import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PhotographyViewer from "@/components/photography/PhotographyViewer";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { StickyCta } from "@/components/site/StickyCta";
import { getPhotographyItems } from "@/lib/server/public-media";
import { getDisciplineTagNav } from "@/lib/server/tag-pages";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("photography");
  return { title: seo.title, description: seo.description };
}
import { getPageSettings } from "@/lib/server/page-settings";
import { PageHeader } from "@/components/shared/PageHeader";

export const revalidate = 300;

export default async function PhotographyPage() {
  const { isActive } = await getPageSettings("photography");
  if (!isActive) redirect("/");

  const [items, nav, seo, sections] = await Promise.all([
    getPhotographyItems(),
    getDisciplineTagNav({ category: "photography", mediaMode: "image" }),
    getPageSeo("photography"),
    getPageSections("photography"),
  ]);

  return (
    <>
      <main className="section-shell pt-8 pb-32">
        <PageHeader
          title={seo.headerTitle}
          description={seo.headerDescription}
          className="max-w-3xl"
        />

        {items.length > 0 ? (
          <PhotographyViewer
            items={items}
            searchCategory="photography"
            tagLinks={nav.tagLinks}
            navChips={nav.chips}
          />
        ) : (
          <PortfolioFallbackPanel
            title="Portraits, fashion, weddings, and atmosphere-led image work."
            text="A photography direction built around emotion, presence, styling, and cinematic composition."
            items={[
              {
                title: "Portraits",
                text: "Strong presence, expressive framing, and a clear visual identity for people-focused work.",
              },
              {
                title: "Fashion",
                text: "Editorial mood, movement, styling, and image construction with a premium finish.",
              },
              {
                title: "Weddings",
                text: "Emotional coverage shaped with intimacy, elegance, and an artistic point of view.",
              },
            ]}
            links={[
              { href: "/services", label: "View services" },
              {
                href: "/contact?category=photography",
                label: "Book photography",
                primary: true,
              },
            ]}
          />
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
