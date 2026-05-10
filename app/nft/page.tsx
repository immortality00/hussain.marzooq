import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";

const marketplaceTargets = ["Foundation", "OpenSea", "objkt", "Exchange Art", "Manifold"];

export default function NftPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border px-3 py-1 text-[11px] tracking-[0.16em] text-muted-foreground">
              DIGITAL WORKS
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">NFT</h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Collectible visual work, editions, and curated digital pieces presented as part of the wider HM Visuals practice.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              What belongs here
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Finished NFT works, edition details, marketplace destinations, and collection context — shown with the same visual care as the rest of the portfolio.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Collection structure
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>1/1 artworks</li>
              <li>Limited editions</li>
              <li>Open editions where relevant</li>
              <li>Availability / sold status</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Marketplace presence
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {marketplaceTargets.map((item) => (
                <span
                  key={item}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] border bg-background/60 p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current state
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            This page is being prepared as a dedicated collection view. Once the NFT items are added from admin,
            this section will become a curated grid with edition data, media previews, and marketplace links.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/photography"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              View image work
            </Link>
            <Link
              href="/contact"
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
            >
              Inquire
            </Link>
          </div>
        </section>
      </main>

      <StickyCta />
    </>
  );
}