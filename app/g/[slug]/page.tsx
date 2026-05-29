import { notFound } from "next/navigation";
import GalleryPasswordForm from "./GalleryPasswordForm";
import { getPrivateGalleryPublicBySlug } from "@/lib/server/private-galleries";
import PrivateGalleryBrowser from "@/components/private-galleries/PrivateGalleryBrowser";

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
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <section className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{gallery.title}</h1>
        {gallery.description ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            {gallery.description}
          </p>
        ) : null}
      </section>

      {gallery.mediaItems.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border p-8 text-sm text-muted-foreground">
          This gallery has no media yet.
        </div>
      ) : (
        <PrivateGalleryBrowser items={gallery.mediaItems} gallerySlug={gallery.slug} />
      )}

      <div className="mt-10 rounded-[2rem] border p-5 text-sm text-muted-foreground">
        Downloads are available for uploaded assets in this gallery.
      </div>
    </main>
  );
}