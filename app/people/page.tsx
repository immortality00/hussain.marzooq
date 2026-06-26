import PeopleIndex from "@/components/people/PeopleIndex";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { StickyCta } from "@/components/site/StickyCta";
import { getPublicPeople } from "@/lib/server/public-people";
import { AnimatedText } from "@/components/shared/AnimatedText";

export const revalidate = 300;

export default async function PeoplePage() {
  const items = await getPublicPeople();

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            <AnimatedText>People</AnimatedText>
          </h1>

          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Portraits, collaborators, artists, dancers, clients, and people
            connected to the visual work.
          </p>
        </section>

        {items.length > 0 ? (
          <PeopleIndex items={items} />
        ) : (
          <PortfolioFallbackPanel
            title="People-focused work built around presence and character."
            text="Portraits, movement, fashion, and collaborations with a clear visual identity."
            items={[
              {
                title: "Portrait presence",
                text: "Images built around expression, posture, atmosphere, and strong personal direction.",
              },
              {
                title: "Movement",
                text: "Dance and performance work shaped through rhythm, timing, and physical language.",
              },
              {
                title: "Creative collaboration",
                text: "Artists, clients, performers, and brands framed through a cinematic point of view.",
              },
            ]}
            links={[
              { href: "/photography", label: "View photography" },
              {
                href: "/contact?category=photography",
                label: "Book a shoot",
                primary: true,
              },
            ]}
          />
        )}
      </main>

      <StickyCta
        title="Looking for portrait or people-focused work?"
        description="Explore the portfolio or book a shoot."
        buttonLabel="Book a shoot"
        href="/contact?service=Portrait%20Inquiry&category=photography&context=Inquiry%20source:%20People%20index"
      />
    </>
  );
}
