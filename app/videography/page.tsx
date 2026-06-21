import { MediaGrid } from "@/components/media/MediaGrid";
import { StickyCta } from "@/components/site/StickyCta";
import { toEmbedUrl } from "@/components/media/utils";
import { getShowreelItem, getVideographyItems } from "@/lib/server/public-media";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VideographyPage() {
  const [showreel, videos] = await Promise.all([getShowreelItem(), getVideographyItems()]);
  const showreelEmbed =
    showreel?.type === "embed" && showreel.embedUrl
      ? toEmbedUrl(showreel.embedUrl) ?? showreel.embedUrl
      : null;

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Videography</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Cinematic films, events, dance, fashion, weddings, and visual stories.
        </p>

        {showreel?.type === "video" && showreel.secureUrl ? (
          <section
            id="showreel"
            className="mt-10 overflow-hidden rounded-3xl border bg-muted scroll-mt-24"
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
            className="mt-10 overflow-hidden rounded-3xl border bg-muted scroll-mt-24"
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
          <MediaGrid items={videos} mediaMode="video" searchCategory="videography" />
        ) : null}
      </main>

      <StickyCta />
    </>
  );
}