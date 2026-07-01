import type { Metadata } from "next";
import PeopleIndex from "@/components/people/PeopleIndex";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { StickyCta } from "@/components/site/StickyCta";
import { getPublicPeople } from "@/lib/server/public-people";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("people");
  return { title: seo.title, description: seo.description };
}
import { getAllPageSettings } from "@/lib/server/page-settings";

export const revalidate = 300;

export default async function PeoplePage() {
  const [items, pageSettings, seo, sections] = await Promise.all([
    getPublicPeople(),
    getAllPageSettings(),
    getPageSeo("people"),
    getPageSections("people"),
  ]);
  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));

  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <PageHeader
          title={seo.headerTitle}
          description={seo.headerDescription}
          className="max-w-3xl"
        />

        {items.length > 0 ? (
          <PeopleIndex items={items} />
        ) : (
          <PortfolioFallbackPanel
            title="People-focused work built around presence and character."
            text="Portraits, movement, fashion, and collaborations with a clear visual identity."
            items={[
              {
                title: "Portrait presence",
                text: "Images built around expression, posture, atmosphere, and strong personal direction.",
              },
              {
                title: "Movement",
                text: "Dance and performance work shaped through rhythm, timing, and physical language.",
              },
              {
                title: "Creative collaboration",
                text: "Artists, clients, performers, and brands framed through a cinematic point of view.",
              },
            ]}
            links={[
              ...(activeSet.has("photography") ? [{ href: "/photography", label: "View photography" }] : []),
              { href: "/contact?category=photography", label: "Book a shoot", primary: true },
            ]}
          />
        )}
      </main>

      <StickyCta
        title={sections.stickyCta.title}
        description={sections.stickyCta.description}
        buttonLabel={sections.stickyCta.buttonLabel}
        href="/contact?service=Portrait%20Inquiry&category=photography&context=Inquiry%20source:%20People%20index"
      />
    </>
  );
}
