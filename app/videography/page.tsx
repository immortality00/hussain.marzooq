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

async function fetchMedia(url: string): Promise<MediaItem[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => null)) as { items?: MediaItem[] };
  return Array.isArray(data?.items) ? data.items : [];
}

export default async function VideographyPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [showreelItems, videoItems] = await Promise.all([
    fetchMedia(`${base}/api/media/list-public?type=all&category=showreel&limit=10`),
    fetchMedia(`${base}/api/media/list-public?type=all&category=videography&limit=60`),
  ]);

  const showreel =
    showreelItems.find((m) => m.type === "embed" && m.embedUrl) ??
    showreelItems.find((m) => (m.type === "video" && m.secureUrl) || (m.type === "embed" && m.embedUrl)) ??
    null;

  const videos = videoItems.filter((m) => m.type === "video" || m.type === "embed");

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Videography</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Showreel on top — full video library below. No extra clicks.
      </p>

      <VideographyClient showreel={showreel} videos={videos} />

      {/* Inline CTA (no StickyCta component) */}
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