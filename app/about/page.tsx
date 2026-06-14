import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";

const disciplines = [
  {
    title: "Photography",
    text: "Portraits, fashion, events, and cinematic still work shaped around atmosphere, presence, and strong visual identity.",
  },
  {
    title: "Film",
    text: "Movement, performance, weddings, festivals, and brand-led stories built with rhythm, emotion, and visual direction.",
  },
  {
    title: "Digital craft",
    text: "Interfaces, portfolios, Web3-ready presentation systems, and custom tools that connect creative work with a refined online experience.",
  },
  {
    title: "Movement",
    text: "Dance and performance influence the way the camera reads posture, timing, energy, and the space around the subject.",
  },
];

const principles = [
  "Cinematic presentation without losing honesty or intimacy.",
  "Creative direction that treats every subject as part of a larger visual world.",
  "Clean systems behind the work, so galleries, people, services, and inquiries stay connected.",
  "Premium execution across public presentation, private delivery, and client communication.",
];

export default function AboutPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border px-3 py-1 text-[11px] tracking-[0.16em] text-muted-foreground">
              HM VISUALS
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Cinematic visual work across photography, film, movement, and digital experience.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              HM Visuals is the creative practice of Hussain Marzooq, built around portraits, fashion,
              events, dance, web experiences, and Web3-ready artwork. The work connects camera craft,
              movement, atmosphere, and strong presentation systems into one visual identity.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Creative position
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The portfolio is not only a gallery. It is a connected platform for visual work, client
              inquiries, private delivery, testimonials, people profiles, services, and selected digital
              experiments.
            </p>
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {disciplines.map((item) => (
            <article
              key={item.title}
              className="rounded-[2rem] border bg-background/60 p-5 shadow-sm backdrop-blur"
            >
              <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Approach
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              High-end work needs direction, not decoration.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The visual language is built around controlled atmosphere, strong subject presence, clean
              composition, and details that feel intentional from the first image to the final delivery.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Principles
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {principles.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-14 rounded-[2rem] border bg-foreground p-6 text-background sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-background/65">
                Work together
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Build a visual direction with weight, rhythm, and identity.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
                Start with photography, film, private galleries, NFT artwork, dance-led visuals, or a
                complete digital presentation system.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/photography"
                className="rounded-xl border border-background/30 px-4 py-2 text-sm transition-colors hover:bg-background/10"
              >
                See the work
              </Link>
              <Link
                href="/contact"
                className="rounded-xl bg-background px-4 py-2 text-sm text-foreground transition-opacity hover:opacity-90"
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