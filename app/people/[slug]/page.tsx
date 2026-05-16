import { notFound } from "next/navigation";
import { MediaGrid } from "@/components/media/MediaGrid";
import { StickyCta } from "@/components/site/StickyCta";
import { getPublicPersonBySlug } from "@/lib/server/public-people";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = await getPublicPersonBySlug(slug);

  if (!person) notFound();

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{person.name}</h1>

            {person.headline ? (
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {person.headline}
              </p>
            ) : null}

            {person.bio ? (
              <div className="mt-6 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                {person.bio}
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border bg-background/60 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Profile
            </div>

            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div>{person.mediaCount} linked public media</div>
              {person.aliases.length ? <div>Aliases: {person.aliases.join(", ")}</div> : null}
            </div>
          </div>
        </section>

        {person.mediaItems.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border p-8 text-sm text-muted-foreground">
            No public media linked to this profile yet.
          </div>
        ) : (
          <MediaGrid items={person.mediaItems} />
        )}
      </main>

      <StickyCta
        title={`Interested in work connected to ${person.name}?`}
        description="Use contact for bookings, collaborations, or appearance-based inquiries."
      />
    </>
  );
}