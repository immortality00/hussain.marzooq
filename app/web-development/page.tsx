import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WebProjectCard } from "@/components/web-development/WebProjectCard";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSettings } from "@/lib/server/page-settings";
import { getPageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";
import { projectUrlLabel, toProjectUrl } from "@/lib/web-projects";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("web-development");
  return { title: seo.title, description: seo.description };
}

export default async function WebDevelopmentPage() {
  const [{ isActive }, seo, content] = await Promise.all([
    getPageSettings("web-development"),
    getPageSeo("web-development"),
    getPageSections("web-development"),
  ]);
  if (!isActive) redirect("/");

  const { projects } = content;
  const cards = (projects.urls ?? [])
    .map((url) => {
      const href = toProjectUrl(url);
      return href ? { href, label: projectUrlLabel(href) } : null;
    })
    .filter((card): card is { href: string; label: string } => card !== null);

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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {projects.heading}
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card, i) => (
                <WebProjectCard
                  key={card.href}
                  href={card.href}
                  label={card.label}
                  priority={i < 3}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <StickyCta
        title={content.stickyCta.title}
        description={content.stickyCta.description}
        buttonLabel={content.stickyCta.buttonLabel}
      />
    </>
  );
}
