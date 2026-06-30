import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MediaGrid } from "@/components/media/MediaGrid";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { StickyCta } from "@/components/site/StickyCta";
import { getPhotographyItems } from "@/lib/server/public-media";
import { getPageSeo } from "@/lib/server/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("photography");
  return { title: seo.title, description: seo.description };
}
import { getPageSettings } from "@/lib/server/page-settings";
import { PageHeader } from "@/components/shared/PageHeader";

export const revalidate = 300;

export default async function PhotographyPage() {
  const { isActive } = await getPageSettings("photography");
  if (!isActive) redirect("/");

  const items = await getPhotographyItems();

  return (
    <>
      <main className="section-shell py-16">
        <PageHeader
          title="Photography"
          description="Cinematic portraits, fashion, weddings, events, and emotional visual stories."
          className="max-w-3xl"
        />

        {items.length > 0 ? (
          <MediaGrid items={items} searchCategory="photography" />
        ) : (
          <PortfolioFallbackPanel
            title="Portraits, fashion, weddings, and atmosphere-led image work."
            text="A photography direction built around emotion, presence, styling, and cinematic composition."
            items={[
              {
                title: "Portraits",
                text: "Strong presence, expressive framing, and a clear visual identity for people-focused work.",
              },
              {
                title: "Fashion",
                text: "Editorial mood, movement, styling, and image construction with a premium finish.",
              },
              {
                title: "Weddings",
                text: "Emotional coverage shaped with intimacy, elegance, and an artistic point of view.",
              },
            ]}
            links={[
              { href: "/services", label: "View services" },
              {
                href: "/contact?category=photography",
                label: "Book photography",
                primary: true,
              },
            ]}
          />
        )}
      </main>

      <StickyCta />
    </>
  );
}
