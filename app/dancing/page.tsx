import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { InstagramFeed } from "@/components/dancing/InstagramFeed";
import { getPageSettings } from "@/lib/server/page-settings";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import { getPageSections } from "@/lib/server/page-sections";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("dancing");
  return buildPublicMetadata({
    title: seo.title,
    description: seo.description,
    image: seo.ogImageUrl,
  });
}

export default async function DancingPage() {
  const [{ isActive }, seo, content] = await Promise.all([
    getPageSettings("dancing"),
    getPageSeo("dancing"),
    getPageSections("dancing"),
  ]);
  if (!isActive) redirect("/");

  const { instagram } = content;
  const hasFeed = instagram.urls.length > 0;

  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <PageHeader
          title={seo.headerTitle}
          description={seo.headerDescription}
          className="max-w-3xl"
        />

        {hasFeed && (
          <section className="mt-12 border-t border-border pt-8">
            {instagram.heading && (
              <h2 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
                {instagram.heading}
              </h2>
            )}
            <InstagramFeed urls={instagram.urls} />
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
