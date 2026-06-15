import Image from "next/image";
import Link from "next/link";
import type { PublicNftItem } from "@/lib/server/public-nfts";

export function HomeCreativeSystem({ nfts }: { nfts: PublicNftItem[] }) {
  const nftImage = nfts.find((item) => item.mediaUrl);

  return (
    <section className="section-shell grid gap-5 py-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="premium-panel p-6 sm:p-8">
        <div className="eyebrow">Creative system</div>

        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          One portfolio. Multiple creative identities. One visual taste.
        </h2>

        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          HM Visuals connects photography, film, NFT collectibles, dance, and web development into
          one custom platform instead of a generic template.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link href="/nft" className="rounded-2xl border bg-background/60 p-4 hover:bg-accent">
            NFT / Web3
          </Link>

          <Link href="/dancing" className="rounded-2xl border bg-background/60 p-4 hover:bg-accent">
            Dancing
          </Link>

          <Link
            href="/web-development"
            className="rounded-2xl border bg-background/60 p-4 hover:bg-accent"
          >
            Web Development
          </Link>

          <Link
            href="/people"
            className="rounded-2xl border bg-background/60 p-4 hover:bg-accent"
          >
            People
          </Link>
        </div>
      </div>

      <Link
        href="/nft"
        className="group relative min-h-[22rem] overflow-hidden rounded-[2rem] border bg-muted shadow-sm"
      >
        {nftImage?.mediaUrl ? (
          <Image
            src={nftImage.mediaUrl}
            alt={nftImage.title || "NFT preview"}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.55),transparent_30%),linear-gradient(135deg,var(--muted),var(--background))]" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <div className="text-xs uppercase tracking-[0.22em] text-white/65">
            NFT / Collectibles
          </div>

          <h2 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight">
            Edition-based digital work with collector-ready presentation.
          </h2>

          <div className="mt-5 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur transition group-hover:bg-white group-hover:text-black">
            Explore
          </div>
        </div>
      </Link>
    </section>
  );
}