import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MediaGrid } from "@/components/media/MediaGrid";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { StickyCta } from "@/components/site/StickyCta";
import { toEmbedUrl } from "@/components/media/utils";
import { getDisciplineTagNav } from "@/lib/server/tag-pages";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import { getPageSections } from "@/lib/server/page-sections";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("videography");
  return buildPublicMetadata({
    title: seo.title,
    description: seo.description,
    image: seo.ogImageUrl,
  });
}
import {
  getShowreelItem,
  getVideographyItems,
} from "@/lib/server/public-media";
import { getPageSettings } from "@/lib/server/page-settings";
import { PageHeader } from "@/components/shared/PageHeader";

export const revalidate = 300;

export default async function VideographyPage() {
  const { isActive } = await getPageSettings("videography");
  if (!isActive) redirect("/");
  const [showreel, videos, nav, seo, sections] = await Promise.all([
    getShowreelItem(),
    getVideographyItems(),
    getDisciplineTagNav({ category: "videography", mediaMode: "video" }),
    getPageSeo("videography"),
    getPageSections("videography"),
  ]);
  const showreelEmbed =
    showreel?.type === "embed" && showreel.embedUrl
      ? (toEmbedUrl(showreel.embedUrl) ?? showreel.embedUrl)
      : null;

  return (
    <>
      <main className="section-shell py-16">
        <PageHeader
          title={seo.headerTitle}
          description={seo.headerDescription}
          className="max-w-3xl"
        />

        {showreel?.type === "video" && showreel.secureUrl ? (
          <section
            id="showreel"
            className="mt-10 overflow-hidden rounded-[2rem] border bg-muted scroll-mt-24"
          >
            <div className="aspect-video w-full bg-black">
              <video
                className="h-full w-full"
                controls
                playsInline
                preload="metadata"
                src={showreel.secureUrl}
              />
            </div>
          </section>
        ) : showreelEmbed ? (
          <section
            id="showreel"
            className="mt-10 overflow-hidden rounded-[2rem] border bg-muted scroll-mt-24"
          >
            <div className="aspect-video w-full bg-black">
              <iframe
                className="h-full w-full"
                src={showreelEmbed}
                title={showreel?.title || "Showreel"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </section>
        ) : null}

        {videos.length > 0 ? (
          <MediaGrid
            items={videos}
            mediaMode="video"
            searchCategory="videography"
            tagLinks={nav.tagLinks}
            navChips={nav.chips}
          />
        ) : (
          <PortfolioFallbackPanel
            title="Films, events, dance, and moving-image work with rhythm."
            text="Video direction shaped around atmosphere, pacing, movement, and cinematic clarity."
            items={[
              {
                title: "Dance & movement",
                text: "Body language, timing, rhythm, and physical energy translated through the camera.",
              },
              {
                title: "Events & festivals",
                text: "Coverage built around atmosphere, pacing, people, and the emotion of the moment.",
              },
              {
                title: "Fashion & weddings",
                text: "Moving-image stories with elegance, texture, and strong visual direction.",
              },
            ]}
            links={[
              { href: "/services", label: "View services" },
              {
                href: "/contact?category=videography",
                label: "Book video",
                primary: true,
              },
            ]}
          />
        )}
      </main>

      <StickyCta
        title={sections.stickyCta.title}
        description={sections.stickyCta.description}
        buttonLabel={sections.stickyCta.buttonLabel}
      />
    </>
  );
}
