import { StickyCta } from "@/components/site/StickyCta";

export default function ShowreelPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Showreel</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A cinematic overview of my videography work. (We’ll add the reel embed
          next.)
        </p>

        <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
          Placeholder: Reel embed goes here.
        </div>
      </main>

      <StickyCta />
    </>
  );
}
