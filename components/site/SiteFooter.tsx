import Link from "next/link";

const primaryLinks = [
  { href: "/photography", label: "Photography" },
  { href: "/videography", label: "Videography" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

const secondaryLinks = [
  { href: "/nft", label: "NFT" },
  { href: "/dance", label: "Dance" },
  { href: "/web-dev", label: "Web Dev" },
  { href: "/people", label: "People" },
  { href: "/blog", label: "Blog" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-background/70 backdrop-blur">
      <div className="section-shell py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <div className="eyebrow">HM VISUALS</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Visual work shaped with cinematic clarity.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Photography, film, movement, creative development, and collectible work — built with a clean visual language and a strong artistic point of view.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Main
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {primaryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Explore
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {secondaryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>HM Visuals — Dubai based, available worldwide.</div>
          <div>Built for clarity, atmosphere, and strong visual storytelling.</div>
        </div>
      </div>
    </footer>
  );
}