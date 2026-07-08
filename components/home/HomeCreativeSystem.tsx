import Link from "next/link";
import SmartImage from "@/components/shared/SmartImage";
import type { HomeSections } from "@/lib/server/page-sections";

const DISCIPLINE_LINKS = [
  { href: "/nft", label: "NFT / Web3", slug: "nft" },
  { href: "/dancing", label: "Dancing", slug: "dancing" },
  { href: "/web-development", label: "Web Development", slug: "web-development" },
  { href: "/people", label: "People", slug: null },
];

export function HomeCreativeSystem({
  activeSet,
  content,
}: {
  activeSet: Set<string>;
  content: HomeSections["creativeSystem"];
}) {
  const creativeLinks = DISCIPLINE_LINKS.filter(
    (item) => item.slug === null || activeSet.has(item.slug),
  );

  // Full-bleed image card matching the Featured Work cards above: image, dark
  // gradient, and text overlaid at the bottom. app/page.tsx places this and
  // HomeServicesPreview side by side inside one shared section-shell grid.
  return (
    <div className="group relative min-h-[25rem] overflow-hidden rounded-[2.25rem] border bg-muted shadow-sm">
      {content.image?.url ? (
        <SmartImage
          src={content.image.url}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/82 via-black/24 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
        <h2 className="max-w-lg text-3xl font-semibold leading-[1.02] tracking-[-0.045em]">
          {content.heading}
        </h2>

        <p className="mt-4 max-w-md text-sm leading-6 text-white/70">{content.paragraph}</p>

        {creativeLinks.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {creativeLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
