import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/photography", label: "Photography" },
  { href: "/videography", label: "Videography" },
  { href: "/services", label: "Services" },
  { href: "/showreel", label: "Showreel" },
  { href: "/photo-reel", label: "Photo Reel" },
  { href: "/nft", label: "NFT" },
  { href: "/dance", label: "Dance" },
  { href: "/web-dev", label: "Web Dev" },
  { href: "/people", label: "People" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          HM Visuals
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact"
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          Book
        </Link>
      </div>
    </header>
  );
}
