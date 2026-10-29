import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLinkGalleryPublic, getLinkGalleryTitle } from "@/lib/server/private-galleries";
import PrivateGalleryBrowser from "@/components/private-galleries/PrivateGalleryBrowser";
import { PageHeader } from "@/components/shared/PageHeader";
import { NoResults } from "@/components/shared/NoResults";
import { LINK_VIEWS_USED_UP_TEXT } from "@/lib/server/gallery-link-limits";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ slug: string; key: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, key } = await params;
  const title = await getLinkGalleryTitle(slug.slice(0, 100), key);

  return {
    title: title || "Gallery",
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function LinkGalleryPage({ params }: Params) {
  const { slug, key } = await params;
  const result = await getLinkGalleryPublic(slug.slice(0, 100), key);
  if (result.state === "missing") notFound();

  const { gallery, viewsUsedUp } = result;

  return (
    <main className="section-shell py-12 sm:py-16">
      <PageHeader
        className="max-w-3xl"
        title={gallery.title}
        description={gallery.description ?? undefined}
      />

      {viewsUsedUp ? (
        <NoResults className="mt-10">{LINK_VIEWS_USED_UP_TEXT}</NoResults>
      ) : gallery.mediaItems.length > 0 ? (
        <PrivateGalleryBrowser items={gallery.mediaItems} gallerySlug={gallery.slug} linkKey={gallery.linkKey} />
      ) : (
        <NoResults className="mt-10">This gallery is empty.</NoResults>
      )}
    </main>
  );
}
