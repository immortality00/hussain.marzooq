import Link from "next/link";
import type { PublicNftItem } from "@/lib/server/public-nfts";
import { PortfolioCard } from "@/components/shared/PortfolioCard";

const DISCIPLINE_LINKS = [
  { href: "/nft", label: "NFT / Web3", slug: "nft" },
  { href: "/dancing", label: "Dancing", slug: "dancing" },
  { href: "/web-development", label: "Web Development", slug: "web-development" },
  { href: "/people", label: "People", slug: null },
];

export function HomeCreativeSystem({
  nfts,
  activeSet,
}: {
  nfts: PublicNftItem[];
  activeSet: Set<string>;
}) {
  const nftImage = nfts.find((item) => item.mediaUrl);
  const showNftCard = activeSet.has("nft");

  const creativeLinks = DISCIPLINE_LINKS.filter(
    (item) => item.slug === null || activeSet.has(item.slug),
  );

  if (creativeLinks.length === 0 && !showNftCard) return null;

  return (
    <section className={`section-shell grid gap-5 py-8 ${showNftCard ? "lg:grid-cols-[0.95fr_1.05fr]" : ""}`}>
      <div className="premium-panel p-6 sm:p-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          One visual identity across stills, film, movement, collectibles, and web experiences.
        </h2>

        <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
          The portfolio connects creative disciplines through the same cinematic taste, clean
          presentation, and strong visual direction.
        </p>

        {creativeLinks.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {creativeLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border bg-background/60 p-4 text-sm hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {showNftCard && (
        <PortfolioCard
          href="/nft"
          title="Digital work with collector-ready presentation."
          imageUrl={nftImage?.mediaUrl}
          ctaLabel="View collection"
          minHeight="min-h-[24rem]"
        />
      )}
    </section>
  );
}