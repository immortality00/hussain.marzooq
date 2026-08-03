import type { Metadata } from "next";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";
import { HomeCreativeSystem } from "@/components/home/HomeCreativeSystem";
import { HomeFeaturedWork } from "@/components/home/HomeFeaturedWork";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeServicesPreview } from "@/components/home/HomeServicesPreview";
import { HomeTrust } from "@/components/home/HomeTrust";
import { StickyCta } from "@/components/site/StickyCta";
import { getPublicServicesData } from "@/lib/server/public-services";
import { getPublicTestimonials } from "@/lib/server/testimonials";
import { getAllPageSettings } from "@/lib/server/page-settings";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("home");
  return { title: seo.title, description: seo.description };
}

export default async function HomePage() {
  const [servicesData, testimonials, pageSettings, seo, sections] = await Promise.all([
    getPublicServicesData(),
    getPublicTestimonials(3),
    getAllPageSettings(),
    getPageSeo("home"),
    getPageSections("home"),
  ]);

  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));

  return (
    <>
      <main>
        <HomeHero
          activeSet={activeSet}
          heroImage={sections.hero.image}
          headerTitle={seo.headerTitle}
          headerDescription={seo.headerDescription}
        />
        <HomeFeaturedWork activeSet={activeSet} cards={sections.featuredCards} />
        <section className="section-shell grid gap-5 py-8 lg:grid-cols-2">
          <HomeCreativeSystem activeSet={activeSet} content={sections.creativeSystem} />
          <HomeServicesPreview
            services={servicesData.services.slice(0, 3)}
            activeSet={activeSet}
            content={sections.servicesPreview}
          />
        </section>
        <HomeTrust testimonials={testimonials.items} content={sections.trust} />
      </main>

      <StickyCta
        title={sections.stickyCta.title}
        description={sections.stickyCta.description}
        buttonLabel={sections.stickyCta.buttonLabel}
      />
    </>
  );
}
