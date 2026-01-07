import { StickyCta } from "@/components/site/StickyCta";

export default function PhotoReelPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Photo Reel</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A curated, cinematic sequence of my best photography. (We’ll build the
          3D/scroll experience next.)
        </p>

        <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
          Placeholder: Photo reel experience goes here.
        </div>
      </main>

      <StickyCta />
    </>
  );
}
