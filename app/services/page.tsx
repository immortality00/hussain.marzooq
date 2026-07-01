import type { Metadata } from "next";
import Image from "next/image";
import { getPageSeo } from "@/lib/server/page-seo";
import Link from "next/link";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import {
  getPublicServicesData,
  workLinkForCategory,
} from "@/lib/server/public-services";
import { PageHeader } from "@/components/shared/PageHeader";
import { getAllPageSettings } from "@/lib/server/page-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("services");
  return { title: seo.title, description: seo.description };
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
          {services.map((s, index) => {
            const img = s.imageUrl.trim();
            const hasPrice =
              typeof s.startingPrice === "number" &&
              Number.isFinite(s.startingPrice);
            const workLink = workLinkForCategory(s.category);
            const imagePriority = index === 0;

            return (
              <article
                key={s.id}
                className="group overflow-hidden rounded-[2rem] border bg-background transition-transform duration-300 hover:-translate-y-[2px]"
              >
                <Link
                  href={`/services/${encodeURIComponent(s.slug)}`}
                  className="block"
                >
                  <div className="relative h-72 overflow-hidden bg-muted">
                    {img ? (
                      <Image
                        src={img}
                        alt={s.name || "Service"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        priority={imagePriority}
                        loading={imagePriority ? "eager" : "lazy"}
                        fetchPriority={imagePriority ? "high" : undefined}
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/68 via-black/14 to-transparent" />

                    <div className="absolute left-4 top-4 inline-flex rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] tracking-[0.14em] text-white backdrop-blur">
                      {s.category.toUpperCase()}
                    </div>

                    {hasPrice ? (
                      <div className="absolute right-4 top-4 inline-flex rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] text-white backdrop-blur">
                        From {s.currency} {s.startingPrice}
                      </div>
                    ) : null}

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h2 className="text-2xl font-semibold tracking-tight text-white">
                        {s.name || "Service"}
                      </h2>
                    </div>
                  </div>
                </Link>

                <div className="p-5">
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {s.description ||
                      "Creative execution tailored to the tone and direction of your project."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      href={`/services/${encodeURIComponent(s.slug)}`}
                      className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      View details
                    </Link>

                    <Link
                      href={`/contact?service=${encodeURIComponent(s.slug)}&category=${encodeURIComponent(s.category)}`}
                      className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
                    >
                      Book
                    </Link>

                    {activeSet.has(workLink.href.replace("/", "")) && (
                      <Link
                        href={workLink.href}
                        className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
                      >
                        {workLink.label}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
