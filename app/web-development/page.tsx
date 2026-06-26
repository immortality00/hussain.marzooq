import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";
import { AnimatedText } from "@/components/shared/AnimatedText";

const capabilities = [
  {
    title: "Creative portfolios",
    text: "High-end portfolio systems with strong visual direction, motion, media structure, and clear client pathways.",
  },
  {
    title: "Custom admin tools",
    text: "Content management flows built around real relationships between media, services, people, galleries, and inquiries.",
  },
  {
    title: "Front-end systems",
    text: "Design-led interfaces, reusable components, responsive layouts, and polished public presentation layers.",
  },
  {
    title: "Interactive direction",
    text: "Digital experiments, Web3-ready presentation, editorial sections, and cinematic UI moments where they add value.",
  },
];

const principles = [
  "Design and code should serve the same visual identity.",
  "Admin systems should make content easier to manage, not harder to understand.",
  "Reusable components should replace duplicated one-off UI blocks.",
  "Public presentation should feel intentional, cinematic, and premium.",
];

export default function WebDevelopmentPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border px-3 py-1 text-[11px] tracking-[0.16em] text-muted-foreground">
              DIGITAL BUILDS
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              <AnimatedText>Web Development</AnimatedText>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Design-led front-end work, custom portfolio systems, admin flows, and digital
              presentation tools connected to the same creative direction as the visual work.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Creative technology
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Visual design, content structure, client experience, and technical execution working
              together inside one focused digital system.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((item) => (
            <article
              key={item.title}
              className="rounded-[2rem] border bg-background/60 p-5 shadow-sm backdrop-blur"
            >
              <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Technical direction
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Interfaces with structure, not just surface.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The work focuses on systems that make creative content easier to present, manage,
              search, connect, and deliver with a premium public experience.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Build principles
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

        <section className="mt-12 rounded-[2rem] border bg-foreground p-6 text-background sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-background/65">
                Creative digital work
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Build a visual system that feels as strong as the work it holds.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
                Create a portfolio, interface, admin system, or digital presentation layer with
                clear structure and high-end visual direction.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/services"
                className="rounded-xl border border-background/30 px-4 py-2 text-sm transition-colors hover:bg-background/10"
              >
                View services
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