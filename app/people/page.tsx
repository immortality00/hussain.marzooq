import PeopleIndex from "@/components/people/PeopleIndex";
import { StickyCta } from "@/components/site/StickyCta";
import { getPublicPeople } from "@/lib/server/public-people";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PeoplePage() {
  const items = await getPublicPeople();

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">People</h1>

          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Featured people connected to public work across the portfolio.
          </p>
        </section>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border p-8 text-sm text-muted-foreground">
            No public people profiles yet.
          </div>
        ) : (
          <PeopleIndex items={items} />
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