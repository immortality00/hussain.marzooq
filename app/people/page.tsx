import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";

const entryPoints = [
  {
    title: "Portrait work",
    href: "/photography",
    description: "Browse image-led work where people remain the center of the frame.",
  },
  {
    title: "Performance & film",
    href: "/videography",
    description: "Explore motion-driven work, performances, and cinematic edits involving featured people.",
  },
  {
    title: "Booking / requests",
    href: "/contact",
    description: "Use contact for collaboration requests, appearance-based work, or portfolio inquiries.",
  },
];

export default function PeoplePage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border px-3 py-1 text-[11px] tracking-[0.16em] text-muted-foreground">
              INDEX
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">People</h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              A public-facing index for work connected to featured people, names, and tagged appearances across the portfolio.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Planned direction
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This section is intended to become a searchable archive of tagged appearances, selected people pages,
              and indexed discovery paths into public media.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {entryPoints.map((item) => (
            <article key={item.title} className="rounded-[2rem] border bg-background/60 p-5">
              <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
              <div className="mt-5">
                <Link
                  href={item.href}
                  className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors inline-flex"
                >
                  Open
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-[2rem] border bg-background/60 p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current state
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            The people index is being shaped around tagged media and public discoverability. As more structured
            data is added, this page will evolve into a clearer searchable entry point.
          </p>
        </section>
      </main>

      <StickyCta />
    </>
  );
}