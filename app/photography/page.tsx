import { MediaGrid } from "@/components/media/MediaGrid";
import { PortfolioFallbackPanel } from "@/components/site/PortfolioFallbackPanel";
import { StickyCta } from "@/components/site/StickyCta";
import { getPhotographyItems } from "@/lib/server/public-media";
import { AnimatedText } from "@/components/shared/AnimatedText";

export const revalidate = 300;

export default async function PhotographyPage() {
  const items = await getPhotographyItems();

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            <AnimatedText>Photography</AnimatedText>
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Cinematic portraits, fashion, weddings, events, and emotional visual
            stories.
          </p>
        </section>

        {items.length > 0 ? (
          <MediaGrid items={items} searchCategory="photography" />
        ) : (
          <PortfolioFallbackPanel
            title="Portraits, fashion, weddings, and atmosphere-led image work."
            text="A photography direction built around emotion, presence, styling, and cinematic composition."
            items={[
              {
                title: "Portraits",
                text: "Strong presence, expressive framing, and a clear visual identity for people-focused work.",
              },
              {
                title: "Fashion",
                text: "Editorial mood, movement, styling, and image construction with a premium finish.",
              },
              {
                title: "Weddings",
                text: "Emotional coverage shaped with intimacy, elegance, and an artistic point of view.",
              },
            ]}
            links={[
              { href: "/services", label: "View services" },
              {
                href: "/contact?category=photography",
                label: "Book photography",
                primary: true,
              },
            ]}
          />
        )}
      </main>

      <StickyCta />
    </>
  );
}
