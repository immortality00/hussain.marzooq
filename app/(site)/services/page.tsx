import type { Metadata } from "next";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import { Suspense } from "react";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { ServiceCard } from "@/components/services/ServiceCard";
import {
  getPublicServicesData,
  workLinkForCategory,
} from "@/lib/server/public-services";
import { PageHeader } from "@/components/shared/PageHeader";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { ServicesFilter, ServicesView } from "@/components/services/ServicesFilter";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("services");
  return buildPublicMetadata({
    title: seo.title,
    description: seo.description,
    path: "/services",
    image: seo.ogImageUrl,
  });
}

export default async function ServicesPage() {
  const [{ services: servicesAll, categories }, pageSettings, seo] = await Promise.all([
    getPublicServicesData(),
    getAllPageSettings(),
    getPageSeo("services"),
  ]);
  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));

  const activeServices = servicesAll.filter((s) => {
    const discipline = workLinkForCategory(s.category).href.replace("/", "");
    return activeSet.has(discipline) || !["photography", "videography", "nft", "dancing", "web-development"].includes(discipline);
  });

  const tabs = [
    { slug: "all", name: "All" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  const view = {
    tabs,
    cards: activeServices.map((s, index) => ({
      id: s.id,
      category: s.category,
      node: <ServiceCard service={s} priority={index === 0} />,
    })),
    empty: (
      <PortfolioFallbackPanel
        title="Creative services shaped around visual direction and clean delivery."
        text="Every project starts with the right format, mood, and production approach."
        items={[
          {
            title: "Photography",
            text: "Portraits, fashion, weddings, events, and image-led creative direction.",
          },
          {
            title: "Film",
            text: "Dance, events, fashion, weddings, festivals, and cinematic stories.",
          },
          {
            title: "Digital",
            text: "Web systems, NFT presentation, portfolio structure, and custom creative tools.",
          },
        ]}
        links={[{ href: "/contact", label: "Start a project", primary: true }]}
      />
    ),
  };

  return (
    <main className="section-shell py-12 sm:py-16">
      <PageHeader
        title={seo.headerTitle}
        description={seo.headerDescription}
        className="max-w-3xl"
      />

      <Suspense fallback={<ServicesView category="all" {...view} />}>
        <ServicesFilter {...view} />
      </Suspense>
    </main>
  );
}
