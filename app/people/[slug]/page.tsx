import Image from "next/image";
import { notFound } from "next/navigation";
import { MediaGrid } from "@/components/media/MediaGrid";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { StickyCta } from "@/components/site/StickyCta";
import { getPublicPersonBySlug } from "@/lib/server/public-people";

export const revalidate = 300;

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
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.55),transparent_26%),linear-gradient(135deg,var(--muted),var(--background))]" />
              )}
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            {person.name}
          </h1>

          {person.bio ? (
            <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-base">
              {person.bio}
            </div>
          ) : null}
        </section>

        {person.mediaItems.length > 0 ? (
          <div className="mt-12">
            <MediaGrid items={person.mediaItems} />
          </div>
        ) : (
          <PortfolioFallbackPanel
            title={`A focused visual profile for ${person.name}.`}
            text="Portraits, collaborations, and related work can be explored through the main photography and video sections."
            items={[
              {
                title: "Photography",
                text: "Portraits, fashion, weddings, events, and cinematic still work.",
              },
              {
                title: "Videography",
                text: "Movement, performance, events, and visual stories in motion.",
              },
              {
                title: "Booking",
                text: "Start a related shoot, collaboration, or people-focused project.",
              },
            ]}
            links={[
              { href: "/photography", label: "Photography" },
              {
                href: "/contact?category=photography",
                label: "Book",
                primary: true,
              },
            ]}
          />
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
