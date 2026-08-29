import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PhotographyViewer from "@/components/photography/PhotographyViewer";
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
  const meta = await getTagMeta({ category: "photography", tagSlug: tag });
  if (!meta) return {};
  return buildPublicMetadata({
    title: meta.seo.title.replaceAll("{tag}", meta.tag.label),
    description: meta.seo.description.replaceAll("{tag}", meta.tag.label),
    image: meta.seo.ogImageUrl,
  });
}

export default async function PhotographyTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const { isActive } = await getPageSettings("photography");
  if (!isActive) redirect("/");

  const data = await getTagPage({ category: "photography", mediaMode: "image", tagSlug: tag });
  if (!data) notFound();

  return (
    <>
      <main className="section-shell pt-8 pb-32">
        <Link
          href="/photography"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Photography
        </Link>

        <PageHeader
          title={data.header.title}
          description={data.header.description}
          className="mt-4 max-w-3xl"
          titleClassName="text-2xl! sm:text-3xl!"
        />

        <PhotographyViewer
          items={data.items}
          searchCategory="photography"
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
