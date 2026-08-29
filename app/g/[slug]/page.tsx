import { notFound } from "next/navigation";
import GalleryPasswordForm from "./GalleryPasswordForm";
import { getPrivateGalleryPublicBySlug } from "@/lib/server/private-galleries";
import PrivateGalleryBrowser from "@/components/private-galleries/PrivateGalleryBrowser";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { PageHeader } from "@/components/shared/PageHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PrivateGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPrivateGalleryPublicBySlug(slug);

  if (result.state === "missing") notFound();

  if (result.state === "locked") {
    return (
      <GalleryPasswordForm
        slug={result.slug}
        title={result.title}
        description={result.description}
      />
    );
  }

  const gallery = result.gallery;

  return (
    <main className="section-shell py-12 sm:py-16">
      <PageHeader
        className="max-w-3xl"
        title={gallery.title}
        description={gallery.description ?? undefined}
      />

      {gallery.mediaItems.length > 0 ? (
        <PrivateGalleryBrowser items={gallery.mediaItems} gallerySlug={gallery.slug} />
      ) : (
        <PortfolioFallbackPanel
          title="Private gallery"
          text="A clean, password-protected space for selected visual work."
          items={[
            {
              title: "Selection",
              text: "A focused private viewing experience for photography and video.",
            },
            {
              title: "Delivery",
              text: "A simple gallery structure designed for reviewing selected work.",
            },
            {
              title: "Access",
              text: "Protected by a private link and password.",
            },
          ]}
        />
      )}
    </main>
  );
}