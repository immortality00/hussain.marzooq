import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";

export default function PortraitServicePage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <Link href="/services" className="text-sm text-muted-foreground underline">
          ← Back to services
        </Link>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight">
          Portrait Photography
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Cinematic portraits with an artistic edge — designed for personal
          branding, creatives, and premium clients.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">What you get</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Concept + mood guidance</li>
              <li>Location & styling recommendations</li>
              <li>Professional edit style matching your look</li>
              <li>Delivery in web + high-res formats</li>
            </ul>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">Perfect for</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Personal branding</li>
              <li>Creative portraits</li>
              <li>Fashion & editorial tests</li>
              <li>Actors, dancers, artists</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
          Placeholder: curated portrait work + testimonials go here.
        </div>
      </main>

      <StickyCta />
    </>
  );
}
