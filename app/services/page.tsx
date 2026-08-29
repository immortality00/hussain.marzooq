import type { Metadata } from "next";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import Link from "next/link";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { ServiceCard } from "@/components/services/ServiceCard";
import {
  getPublicServicesData,
  workLinkForCategory,
} from "@/lib/server/public-services";
import { PageHeader } from "@/components/shared/PageHeader";
import { getAllPageSettings } from "@/lib/server/page-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("services");
  return buildPublicMetadata({
    title: seo.title,
    description: seo.description,
    image: seo.ogImageUrl,
  });
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const selectedCategory =
    typeof sp.category === "string" ? sp.category : "all";

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

  const services =
    selectedCategory === "all"
      ? activeServices
      : activeServices.filter(
          (s) => s.category.toLowerCase() === selectedCategory.toLowerCase(),
        );

  const tabs = [
    { slug: "all", name: "All" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <main className="section-shell py-12 sm:py-16">
      <PageHeader
        title={seo.headerTitle}
        description={seo.headerDescription}
        className="max-w-3xl"
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.slug === selectedCategory;
          return (
            <Link
              key={t.slug}
              href={
                t.slug === "all"
                  ? "/services"
                  : `/services?category=${encodeURIComponent(t.slug)}`
              }
              className={[
                "rounded-full border px-4 py-2 text-xs transition-colors",
                active ? "bg-foreground text-background" : "hover:bg-accent",
              ].join(" ")}
            >
              {t.name}
            </Link>
          );
        })}
      </div>

      {services.length === 0 ? (
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
          links={[
            { href: "/contact", label: "Start a project", primary: true },
          ]}
        />
      ) : (
        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s, index) => (
            <ServiceCard key={s.id} service={s} activeSet={activeSet} priority={index === 0} />
          ))}
        </section>
      )}
    </main>
  );
}
