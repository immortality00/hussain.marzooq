import { MediaGrid } from "@/components/media/MediaGrid";
import { StickyCta } from "@/components/site/StickyCta";
import { toEmbedUrl } from "@/components/media/utils";
import { getShowreelUrl, getVideographyItems } from "@/lib/server/public-media";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VideographyPage() {
  const [showreelUrl, videos] = await Promise.all([getShowreelUrl(), getVideographyItems()]);

  const showreelEmbed = showreelUrl ? toEmbedUrl(showreelUrl) ?? showreelUrl : null;

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Videography</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Showreel on top — searchable, filterable video library below.
        </p>

        <section id="showreel" className="mt-10 overflow-hidden rounded-3xl border bg-muted scroll-mt-24">
          <div className="border-b px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Showreel</div>
              <div className="text-xs text-muted-foreground">
                A curated entry point into the video library.
              </div>
            </div>

            <a
              href="#videos"
              className="rounded-xl border px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              Watch videos
            </a>
          </div>

          <div className="aspect-video w-full bg-black">
            {showreelEmbed ? (
              <iframe
                className="h-full w-full"
                src={showreelEmbed}
                title="Showreel"
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