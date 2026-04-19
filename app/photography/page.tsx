import { StickyCta } from "@/components/site/StickyCta";
import { MediaGrid } from "@/components/media/MediaGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Appearance = {
  kind: "featured" | "exhibited";
  title: string;
  venue: string;
  city: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  notes: string;
  link: string;
};

type MediaItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories: string[];
  people: string[];
  appearances: Appearance[];
  secureUrl: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};

async function fetchMedia(url: string): Promise<MediaItem[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => null)) as { items?: MediaItem[] };
  return Array.isArray(data?.items) ? data.items : [];
}

async function getPhotos(): Promise<MediaItem[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const primary = await fetchMedia(`${base}/api/media/list-public?type=image&category=photography&limit=60`);
  if (primary.length) return primary;
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
          <MediaGrid items={items} />
        )}
      </main>

      <StickyCta />
    </>
  );
}