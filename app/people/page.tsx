import { StickyCta } from "@/components/site/StickyCta";
import PeopleIndex from "@/components/people/PeopleIndex";
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
            Public profiles connected to tagged work across the portfolio, making featured people easier to discover and navigate.
          </p>
        </section>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border p-8 text-sm text-muted-foreground">
            No public people profiles yet. Create them from Admin → People.
          </div>
        ) : (
          <PeopleIndex items={items} />
        )}
      </main>

      <StickyCta
        title="Need a featured profile or collaboration?"
        description="Use contact for people-based collaborations, appearance requests, or portfolio inquiries."
      />
    </>
  );
}