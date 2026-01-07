import { StickyCta } from "@/components/site/StickyCta";

export default function PhotographyPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Photography</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Browse portraits, fashion, weddings, and more. (Filters + search will
          be added soon.)
        </p>

        <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
          Placeholder: Photography gallery grid goes here.
        </div>
      </main>

      <StickyCta />
    </>
  );
}
