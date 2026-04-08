import { StickyCta } from "@/components/site/StickyCta";
import { MediaGrid } from "@/components/media/MediaGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MediaItem = {
  id: string;
  type: string;
  title: string;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories?: string[];
  secureUrl: string | null;
  createdAt: string | null;
};

async function fetchMedia(url: string): Promise<MediaItem[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: MediaItem[] };
  return Array.isArray(data.items) ? data.items : [];
}

async function getPhotos(): Promise<MediaItem[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const primary = await fetchMedia(`${base}/api/media/list-public?type=image&category=photography&limit=60`);
  if (primary.length) return primary;

  // fallback: show all images if nothing categorized yet
  return fetchMedia(`${base}/api/media/list-public?type=image&limit=60`);
}

export default async function PhotographyPage() {
  const items = await getPhotos();

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Photography</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Cinematic portraits, fashion, weddings, and moments — curated.
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
            No photos yet. Upload from Admin → Media.
          </div>
        ) : (
          <MediaGrid
            items={items.map((m) => ({
              id: m.id,
              title: m.title,
              location: m.location,
              event: m.event,
              year: m.year,
              tags: m.tags,
              secureUrl: m.secureUrl,
            }))}
          />
        )}
      </main>

      <StickyCta />
    </>
  );
}