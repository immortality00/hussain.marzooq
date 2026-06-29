import Image from "next/image";
import Link from "next/link";
import type { PublicNftItem } from "@/lib/server/public-nfts";

const creativeLinks = [
  { href: "/nft", label: "NFT / Web3" },
  { href: "/dancing", label: "Dancing" },
  { href: "/web-development", label: "Web Development" },
  { href: "/people", label: "People" },
];

export function HomeCreativeSystem({ nfts }: { nfts: PublicNftItem[] }) {
  const nftImage = nfts.find((item) => item.mediaUrl);

  return (
    <section className="section-shell grid gap-5 py-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="premium-panel p-6 sm:p-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          One visual identity across stills, film, movement, collectibles, and web experiences.
        </h2>

        <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
          The portfolio connects creative disciplines through the same cinematic taste, clean
          presentation, and strong visual direction.
        </p>

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
      </div>

      <Link
        href="/nft"
        className="group relative min-h-[24rem] overflow-hidden rounded-[2.25rem] border bg-muted shadow-sm"
      >
        {nftImage?.mediaUrl ? (
          <Image
            src={nftImage.mediaUrl}
            alt={nftImage.title || "NFT work"}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/82 via-black/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <h2 className="max-w-lg text-3xl font-semibold leading-[1.02] tracking-[-0.045em]">
            Digital work with collector-ready presentation.
          </h2>

          <div className="mt-6 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur transition group-hover:bg-white group-hover:text-black">
            View collection
          </div>
        </div>
      </Link>
    </section>
  );
}