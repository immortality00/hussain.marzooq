import type { Metadata } from "next";
import SmartImage from "@/components/shared/SmartImage";
import { notFound } from "next/navigation";
import { MediaGrid } from "@/components/media/MediaGrid";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { StickyCta } from "@/components/site/StickyCta";
import { getPersonPageBySlug, getPublicPersonBySlug } from "@/lib/server/public-people";
import PersonPasswordForm from "./PersonPasswordForm";
import RemovalRequestButton from "@/components/people/RemovalRequestButton";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { getPageSections } from "@/lib/server/page-sections";
import { getPageSeo } from "@/lib/server/page-seo";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [person, seo] = await Promise.all([
    getPublicPersonBySlug(slug),
    getPageSeo("people-detail"),
  ]);
  if (!person) return {};
  return {
    title: seo.title.replaceAll("{name}", person.name),
    description: seo.description.replaceAll("{name}", person.name),
  };
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [state, pageSettings, sections] = await Promise.all([
    getPersonPageBySlug(slug),
    getAllPageSettings(),
    getPageSections("people-detail"),
  ]);

  if (state.state === "missing") notFound();

  if (state.state === "locked") {
    return (
      <PersonPasswordForm
        slug={state.slug}
        name={state.name}
        bio={state.bio}
        avatarUrl={state.avatarUrl}
      />
    );
  }

  if (state.state === "unavailable") {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <section className="rounded-[2rem] border p-6 text-center">
          <div className="flex justify-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
              {state.avatarUrl ? (
                <SmartImage
                  src={state.avatarUrl}
                  alt={state.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : null}
            </div>
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">{state.name}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Content not available.</p>
        </section>
      </main>
    );
  }

  const person = state.person;
  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));

  return (
    <>
      <main className="section-shell py-12 sm:py-16">
        <section className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border bg-muted sm:h-36 sm:w-36">
              {person.avatarUrl ? (
                <SmartImage
                  src={person.avatarUrl}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            <AnimatedText>{person.name}</AnimatedText>
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
              ...(activeSet.has("photography") ? [{ href: "/photography", label: "Photography" }] : []),
              { href: "/contact?category=photography", label: "Book", primary: true },
            ]}
          />
        )}

        <RemovalRequestButton slug={person.slug} />
      </main>

      <StickyCta
        title={sections.stickyCta.title}
        description={sections.stickyCta.description}
        buttonLabel={sections.stickyCta.buttonLabel}
        href={`/contact?service=Portrait%20Inquiry&category=photography&context=${encodeURIComponent(`Inquiry source: /people/${person.slug}\nRelated profile: ${person.name}`)}`}
      />
    </>
  );
}
