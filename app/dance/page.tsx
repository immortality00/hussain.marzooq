import { StickyCta } from "@/components/site/StickyCta";

export default function DancePage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Dance</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Performances, films, festivals, and teaching. (We’ll add curated dance
          videos and optional Instagram highlights.)
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
            Placeholder: Dance films / performance videos.
          </div>
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
            Placeholder: Instagram highlights (curated embeds).
          </div>
        </div>
      </main>

      <StickyCta />
    </>
  );
}
