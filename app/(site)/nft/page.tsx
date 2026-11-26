import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPageSeo } from "@/lib/server/page-seo";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";
import { getPageSections } from "@/lib/server/page-sections";
import { StickyCta } from "@/components/site/StickyCta";
import NftCollection from "@/components/nft/NftCollection";
import { getPublicNfts } from "@/lib/server/public-nfts";
import { getTagLinks } from "@/lib/server/tag-pages";
import { getPageSettings } from "@/lib/server/page-settings";
import { PageHeader } from "@/components/shared/PageHeader";
import { TitleBarFrame } from "@/components/shared/title-bar/TitleBarFrame";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("nft");
  return buildPublicMetadata({
    title: seo.title,
    description: seo.description,
    path: "/nft",
    image: seo.ogImageUrl,
  });
}

export default async function NftPage() {
  const { isActive } = await getPageSettings("nft");
  if (!isActive) redirect("/");

  const [items, seo, sections, tagLinks] = await Promise.all([
    getPublicNfts(),
    getPageSeo("nft"),
    getPageSections("nft"),
    getTagLinks(),
  ]);

  return (
    <>
      <TitleBarFrame title={seo.headerTitle}>
        <main className="section-shell py-12 sm:py-16">
          <PageHeader
            title={seo.headerTitle}
            description={seo.headerDescription}
            className="max-w-3xl"
          />

          <NftCollection items={items} tagLinks={tagLinks} />
        </main>
      </TitleBarFrame>

      <StickyCta
        title={sections.stickyCta.title}
        description={sections.stickyCta.description}
        buttonLabel={sections.stickyCta.buttonLabel}
      />
    </>
  );
}
