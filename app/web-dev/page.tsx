import { StickyCta } from "@/components/site/StickyCta";

export default function WebDevPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Web Development</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A curated space for my builds, UI experiments, and design work. (We’ll
          start minimal and grow it over time.)
        </p>

        <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
          Placeholder: “Labs / Builds” grid goes here.
        </div>
      </main>

      <StickyCta />
    </>
  );
}
