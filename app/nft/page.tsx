import type { Metadata } from "next";
import { StickyCta } from "@/components/site/StickyCta";
import NftCollection from "@/components/nft/NftCollection";
import { getPublicNfts } from "@/lib/server/public-nfts";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "NFT Collection | HM Visuals",
  description:
    "Explore HM Visuals collectible NFT works, edition structures, availability, and marketplace access.",
};

export default async function NftPage() {
  const items = await getPublicNfts();

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            NFT
          </h1>

          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Published collectible works, edition structure, and marketplace
            access — all presented inside one unified collection page.
          </p>
        </section>

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
