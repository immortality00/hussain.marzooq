import type { Metadata } from "next";
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

export const revalidate = 300;

export const metadata: Metadata = {
  title: "HM Visuals — Cinematic Photography, Film & Creative Direction",
  description:
    "Premium portfolio of Hussain Marzooq across photography, videography, NFT work, dance, web development, and creative visual direction.",
};

export default async function HomePage() {
  const [photos, videos, showreelUrl, nfts, servicesData, testimonials] =
    await Promise.all([
      getPhotographyItems(),
      getVideographyItems(),
      getShowreelUrl(),
      getPublicNfts(),
      getPublicServicesData(),
      getPublicTestimonials(3),
    ]);

  return (
    <>
      <main>
        <HomeHero photos={photos} videos={videos} />
        <HomeFeaturedWork photos={photos} videos={videos} />
        <HomeCreativeSystem nfts={nfts} />
        <HomeServicesPreview services={servicesData.services.slice(0, 3)} />
        <HomeTrustAndShowreel
          testimonial={testimonials.items[0] ?? null}
          showreelUrl={showreelUrl}
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
