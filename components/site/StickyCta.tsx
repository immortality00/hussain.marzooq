"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NextCta = { href: string; label: string };

function getNextCta(pathname: string): NextCta {
  // Simple, safe routing table (we’ll improve later)
  if (pathname === "/showreel") return { href: "/services", label: "See Services" };
  if (pathname === "/photo-reel") return { href: "/services", label: "See Services" };

  if (pathname.startsWith("/photography")) return { href: "/photo-reel", label: "Photo Reel" };
  if (pathname.startsWith("/videography")) return { href: "/showreel", label: "Showreel" };

  if (pathname.startsWith("/nft")) return { href: "/nft", label: "Explore NFTs" };
  if (pathname.startsWith("/dance")) return { href: "/dance", label: "More Dance" };
  if (pathname.startsWith("/web-dev")) return { href: "/web-dev", label: "Explore Builds" };

  if (pathname.startsWith("/people")) return { href: "/photography", label: "Explore Work" };

  return { href: "/photography", label: "Explore Work" };
}

export function StickyCta() {
  const pathname = usePathname();
  const next = getNextCta(pathname);

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 backdrop-blur px-3 py-3 shadow-sm">
          <div className="text-sm text-muted-foreground">
            Ready when you are.
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={next.href}
              className="rounded-full border px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              {next.label}
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
            >
              Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
