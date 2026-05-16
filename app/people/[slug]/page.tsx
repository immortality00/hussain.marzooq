import Image from "next/image";
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
        <section className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border bg-muted sm:h-36 sm:w-36">
              {person.avatarUrl ? (
                <Image
                  src={person.avatarUrl}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                  priority
                />
              ) : null}
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{person.name}</h1>

          {person.bio ? (
            <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-base">
              {person.bio}
            </div>
          ) : null}
        </section>

        {person.mediaItems.length === 0 ? (
          <div className="mt-12 rounded-[2rem] border p-8 text-sm text-muted-foreground">
            No public work linked to this profile yet.
          </div>
        ) : (
          <div className="mt-12">
            <MediaGrid items={person.mediaItems} />
          </div>
        )}
      </main>

      <StickyCta
        title="Inspired by this style of work?"
        description="Book a portrait, fashion, or people-focused shoot."
        buttonLabel="Book a shoot"
        href={`/contact?service=Portrait%20Inquiry&category=photography&context=${encodeURIComponent(`Inquiry source: /people/${person.slug}\nRelated profile: ${person.name}`)}`}
      />
    </>
  );
}