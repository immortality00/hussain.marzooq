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

        <section id="showreel" className="mt-10 overflow-hidden rounded-3xl border bg-muted scroll-mt-24">
          <div className="aspect-video w-full bg-black">
            {showreel?.type === "video" && showreel.secureUrl ? (
              <video
                className="h-full w-full"
                controls
                playsInline
                preload="metadata"
                src={showreel.secureUrl}
              />
            ) : showreelEmbed ? (
              <iframe
                className="h-full w-full"
                src={showreelEmbed}
                title={showreel?.title || "Showreel"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
                The showreel is being prepared.
              </div>
            )}
          </div>
        </section>

        {videos.length === 0 ? (
          <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
            A new video selection is being prepared. Please check back soon.
          </div>
        ) : (
          <MediaGrid items={videos} mediaMode="video" searchCategory="videography" />
        )}
      </main>

      <StickyCta />
    </>
  );
}