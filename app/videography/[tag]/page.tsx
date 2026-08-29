import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MediaGrid } from "@/components/media/MediaGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { StickyCta } from "@/components/site/StickyCta";
import { getPageSettings } from "@/lib/server/page-settings";
import { getTagMeta, getTagPage } from "@/lib/server/tag-pages";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const meta = await getTagMeta({ category: "videography", tagSlug: tag });
  if (!meta) return {};
  return buildPublicMetadata({
    title: meta.seo.title.replaceAll("{tag}", meta.tag.label),
    description: meta.seo.description.replaceAll("{tag}", meta.tag.label),
    image: meta.seo.ogImageUrl,
  });
}

export default async function VideographyTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const { isActive } = await getPageSettings("videography");
  if (!isActive) redirect("/");

  const data = await getTagPage({ category: "videography", mediaMode: "video", tagSlug: tag });
  if (!data) notFound();

  return (
    <>
      <main className="section-shell py-16">
        <Link
          href="/videography"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Videography
        </Link>

        <PageHeader
          title={data.header.title}
          description={data.header.description}
          className="mt-4 max-w-3xl"
        />

        <MediaGrid
          items={data.items}
          mediaMode="video"
          searchCategory="videography"
          lockedTag={tag}
          tagLinks={data.tagLinks}
          navChips={data.chips}
        />
      </main>

      <StickyCta
        title={data.stickyCta.title}
        description={data.stickyCta.description}
        buttonLabel={data.stickyCta.buttonLabel}
      />
    </>
  );
}
