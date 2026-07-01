import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPageSeo } from "@/lib/server/page-seo";
import { StickyCta } from "@/components/site/StickyCta";
import NftCollection from "@/components/nft/NftCollection";
import { getPublicNfts } from "@/lib/server/public-nfts";
import { getPageSettings } from "@/lib/server/page-settings";
import { PageHeader } from "@/components/shared/PageHeader";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("nft");
  return { title: seo.title, description: seo.description };
}

export default async function NftPage() {
  const { isActive } = await getPageSettings("nft");
  if (!isActive) redirect("/");

  const [items, seo] = await Promise.all([getPublicNfts(), getPageSeo("nft")]);

  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <PageHeader
          title={seo.headerTitle}
          description={seo.headerDescription}
          className="max-w-3xl"
        />

        <NftCollection items={items} />
      </main>

      <StickyCta
        title="Interested in a piece?"
        description="Ask about availability, editions, or collector details."
        buttonLabel="Inquire"
      />
    </>
  );
}
