import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";

const sections = [
  {
    title: "Performance",
    description: "Movement-led visuals, stage energy, rehearsals, and cinematic dance-driven storytelling.",
  },
  {
    title: "Teaching",
    description: "Classes, workshops, training sessions, and educational visual content built with clarity.",
  },
  {
    title: "Collaborations",
    description: "Creative partnerships with artists, festivals, brands, and visual projects shaped around movement.",
  },
];

export default function DancePage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border px-3 py-1 text-[11px] tracking-[0.16em] text-muted-foreground">
              MOVEMENT
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Dance</h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Performance, teaching, and visual work shaped around rhythm, motion, and presence.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              This page
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A dedicated space for movement-based work, from cinematic performance visuals to educational and collaborative dance projects.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {sections.map((item) => (
            <article key={item.title} className="rounded-[2rem] border bg-background/60 p-5">
              <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Current direction
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This page will evolve into a stronger entry point for performance films, festival visuals,
              teaching material, and movement-led collaborations.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Next step
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/videography"
                className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                View video work
              </Link>
              <Link
                href="/contact?category=dance"
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
              >
                Book or collaborate
              </Link>
            </div>
          </div>
        </section>
      </main>

      <StickyCta />
    </>
  );
}