import { StickyCta } from "@/components/site/StickyCta";

export default function VideographyPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Videography</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Browse dance films, festivals, parties, fashion, weddings, and events.
          (Projects and filters are coming.)
        </p>

        <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
          Placeholder: Video gallery grid goes here.
        </div>
      </main>

      <StickyCta />
    </>
  );
}
