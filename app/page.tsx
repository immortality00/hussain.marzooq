import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Dubai based • Available worldwide
        </p>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Cinematic photography & film — crafted with artistic precision.
        </h1>

        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Portraits, fashion, weddings, and performance films. Explore work by
          category, people, location, tags, or projects. Private galleries
          available for clients.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/photography"
            className="rounded-full border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Explore Photography
          </Link>
          <Link
            href="/showreel"
            className="rounded-full border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Watch Showreel
          </Link>
          <Link
            href="/services"
            className="rounded-full border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Services
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
          >
            Book
          </Link>
        </div>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Photography", href: "/photography", desc: "Portraits • Fashion • Weddings" },
          { title: "Videography", href: "/videography", desc: "Dance • Events • Cinematic films" },
          { title: "NFT", href: "/nft", desc: "Drops • Editions • Marketplace links" },
          { title: "Dance", href: "/dance", desc: "Performance • Teaching • Highlights" },
          { title: "Web Dev", href: "/web-dev", desc: "Builds • UI • Experiments" },
          { title: "People", href: "/people", desc: "Search work by name" },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border p-5 hover:bg-accent/40 transition-colors"
          >
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
