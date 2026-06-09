import { MediaGrid } from "@/components/media/MediaGrid";
import { StickyCta } from "@/components/site/StickyCta";
import { getPhotographyItems } from "@/lib/server/public-media";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PhotographyPage() {
  const items = await getPhotographyItems();

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
          <MediaGrid items={items} searchCategory="photography" />
        )}
      </main>

      <StickyCta />
    </>
  );
}