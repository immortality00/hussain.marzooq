import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPageSettings, getAllPageSettings } from "@/lib/server/page-settings";
import { getPageSeo } from "@/lib/server/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("dancing");
  return { title: seo.title, description: seo.description };
}

const sections = [
  {
    title: "Performance",
    description: "Movement-led visuals, stage energy, rehearsals, and cinematic dance-driven storytelling.",
  },
  {
    title: "Teaching",
    description: "Classes, workshops, training sessions, and educational visual content shaped with clarity and rhythm.",
  },
  {
    title: "Collaborations",
    description: "Creative partnerships with artists, festivals, brands, and visual projects built around movement.",
  },
];

const directions = [
  "Performance films and movement-led visual pieces.",
  "Festival, rehearsal, and behind-the-scenes dance coverage.",
  "Teaching, workshops, and class documentation.",
  "Creative collaborations where motion becomes the visual language.",
];

export default async function DancingPage() {
  const [{ isActive }, allSettings] = await Promise.all([
    getPageSettings("dancing"),
    getAllPageSettings(),
  ]);
  if (!isActive) redirect("/");
  const activeSet = new Set(allSettings.filter((p) => p.isActive).map((p) => p.slug));
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <PageHeader
            eyebrow="MOVEMENT"
            title="Dancing"
            description="Performance, teaching, and visual work shaped around rhythm, motion, presence, and the way bodies transform space on camera."
          />

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Movement language
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Dance informs both the performance work and the camera work: timing, weight, pauses,
              transitions, and the emotional shape of movement.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {sections.map((item) => (
            <article
              key={item.title}
              className="rounded-[2rem] border bg-background/60 p-5 shadow-sm backdrop-blur"
            >
              <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Direction
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Dance as performance, archive, and visual identity.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This section connects movement-based work with the wider HM Visuals practice: cinematic
              video, performance documentation, creative collaborations, and teaching material.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Work covered
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {directions.map((item) => (
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
                Movement-led visuals
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Create dance work with cinematic direction.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
                Build a performance film, document a class or festival, or shape a collaboration around
                movement.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {activeSet.has("videography") && (
                <Link
                  href="/videography"
                  className="rounded-xl border border-background/30 px-4 py-2 text-sm transition-colors hover:bg-background/10"
                >
                  View video work
                </Link>
              )}
              <Link
                href="/contact?category=dance"
                className="rounded-xl bg-background px-4 py-2 text-sm text-foreground transition-opacity hover:opacity-90"
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