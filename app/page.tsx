import type { Metadata } from "next";
import { getPageSeo } from "@/lib/server/page-seo";
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
  const [photos, videos, showreelUrl, nfts, servicesData, testimonials, pageSettings] =
    await Promise.all([
      getPhotographyItems(),
      getVideographyItems(),
      getShowreelUrl(),
      getPublicNfts(),
      getPublicServicesData(),
      getPublicTestimonials(3),
      getAllPageSettings(),
    ]);

  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));

  return (
    <>
      <main>
        <HomeHero photos={photos} videos={videos} activeSet={activeSet} />
        <HomeFeaturedWork photos={photos} videos={videos} activeSet={activeSet} />
        <HomeCreativeSystem nfts={nfts} activeSet={activeSet} />
        <HomeServicesPreview services={servicesData.services.slice(0, 3)} activeSet={activeSet} />
        <HomeTrustAndShowreel
          testimonial={testimonials.items[0] ?? null}
          showreelUrl={showreelUrl}
          activeSet={activeSet}
        />
      </main>

      <StickyCta
        title="Ready to create something strong?"
        description="Tell me the work you need and I'll reply with the best direction."
        buttonLabel="Book"
      />
    </>
  );
}
