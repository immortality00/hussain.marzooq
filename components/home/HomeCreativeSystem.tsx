import Link from "next/link";
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

  // Renders a bare panel: app/page.tsx places this and HomeServicesPreview
  // side by side inside one shared section-shell grid.
  return (
    <div className="premium-panel p-6 sm:p-8">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{content.heading}</h2>

      <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
        {content.paragraph}
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
  );
}
