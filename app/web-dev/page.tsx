import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";

const capabilities = [
  "Creative portfolio builds",
  "Design-led front-end systems",
  "Interactive experiments",
  "Custom admin flows",
];

export default function WebDevPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border px-3 py-1 text-[11px] tracking-[0.16em] text-muted-foreground">
              DIGITAL BUILDS
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Web Dev</h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              A curated extension of the portfolio focused on front-end craft, interfaces, creative experiments,
              and digital presentation systems.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Positioning
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This section is not meant to feel like a generic dev portfolio. It should connect interface work,
              visual design, and presentation quality back to the wider HM Visuals identity.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((item) => (
            <div key={item} className="rounded-[2rem] border bg-background/60 p-5 text-sm text-muted-foreground">
              {item}
            </div>
          ))}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              What will live here
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>Selected builds and interface projects</li>
              <li>Short project summaries with role and outcome</li>
              <li>Creative UI experiments and concept work</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              In the meantime
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/services"
                className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                View services
              </Link>
              <Link
                href="/contact"
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
              >
                Start a project
              </Link>
            </div>
          </div>
        </section>
      </main>

      <StickyCta />
    </>
  );
}