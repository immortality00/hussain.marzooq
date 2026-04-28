import { getShowreelUrl, getVideographyItems } from "@/lib/server/public-media";
import VideographyClient from "./videographyClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MediaItem = {
  id: string;
  type: string;
  title: string;
  embedUrl: string | null;
  secureUrl: string | null;
  tags: string[];
  categories?: string[];
};

export default async function VideographyPage() {
  const [showreelUrl, videos] = await Promise.all([getShowreelUrl(), getVideographyItems()]);

  const showreel: MediaItem | null = showreelUrl
    ? {
        id: "site-showreel",
        type: "embed",
        title: "Showreel",
        embedUrl: showreelUrl,
        secureUrl: null,
        tags: [],
        categories: ["showreel"],
      }
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Videography</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Showreel on top — full video library below. No extra clicks.
      </p>

      <VideographyClient showreel={showreel} videos={videos} />

      <div className="mt-12 rounded-3xl border bg-background p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold">Ready to book?</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Describe your project — I’ll reply with next steps.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/contact?category=videography"
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
            >
              Book
            </a>

            <a
              href="#videos"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              Watch videos
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}