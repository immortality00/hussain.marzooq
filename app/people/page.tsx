import { StickyCta } from "@/components/site/StickyCta";

export default function PeoplePage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">People</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Search work by name. (Public and indexed by Google. We’ll add a
          removal request flow with your approval.)
        </p>

        <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
          Placeholder: People search + results grid goes here.
        </div>
      </main>

      <StickyCta />
    </>
  );
}
