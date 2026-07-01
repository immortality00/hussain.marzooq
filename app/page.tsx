import type { Metadata } from "next";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";
import { HomeCreativeSystem } from "@/components/home/HomeCreativeSystem";
import { HomeFeaturedWork } from "@/components/home/HomeFeaturedWork";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeServicesPreview } from "@/components/home/HomeServicesPreview";
import { HomeTrustAndShowreel } from "@/components/home/HomeTrustAndShowreel";
import { StickyCta } from "@/components/site/StickyCta";
import {
  getPhotographyItems,
  getShowreelUrl,
  getVideographyItems,
} from "@/lib/server/public-media";
import { getPublicNfts } from "@/lib/server/public-nfts";
import { getPublicServicesData } from "@/lib/server/public-services";
import { getPublicTestimonials } from "@/lib/server/testimonials";
import { getAllPageSettings } from "@/lib/server/page-settings";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("home");
  return { title: seo.title, description: seo.description };
}

export default async function HomePage() {
  const [photos, videos, showreelUrl, nfts, servicesData, testimonials, pageSettings, seo, sections] =
    await Promise.all([
      getPhotographyItems(),
      getVideographyItems(),
      getShowreelUrl(),
      getPublicNfts(),
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
          photos={photos}
          videos={videos}
          activeSet={activeSet}
          headerTitle={seo.headerTitle}
          headerDescription={seo.headerDescription}
        />
        <HomeFeaturedWork
          photos={photos}
          videos={videos}
          activeSet={activeSet}
          content={sections.featuredWork}
        />
        <HomeCreativeSystem nfts={nfts} activeSet={activeSet} content={sections.creativeSystem} />
        <HomeServicesPreview
          services={servicesData.services.slice(0, 3)}
          activeSet={activeSet}
          content={sections.servicesPreview}
        />
        <HomeTrustAndShowreel
          testimonial={testimonials.items[0] ?? null}
          showreelUrl={showreelUrl}
          activeSet={activeSet}
          content={{ trust: sections.trust, showreel: sections.showreel }}
        />
      </main>

      <StickyCta
        title={sections.stickyCta.title}
        description={sections.stickyCta.description}
        buttonLabel={sections.stickyCta.buttonLabel}
      />
    </>
  );
}
