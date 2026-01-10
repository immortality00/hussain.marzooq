import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toEmbedUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "");

  // YouTube (privacy-enhanced)
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = u.searchParams.get("v");
    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (host === "youtu.be") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  // Vimeo
  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    if (!id) return null;
    return `https://player.vimeo.com/video/${id}`;
  }

  // Already embed/player URL
  if (host === "player.vimeo.com") return input;
  if (host === "youtube-nocookie.com") return input;
  if (host === "youtube.com" && u.pathname.includes("/embed/")) return input;

  return null;
}

async function getShowreel(): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/site-settings/showreel`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { embedUrl?: string | null };
  return typeof data.embedUrl === "string" ? data.embedUrl : null;
}

export default async function VideographyPage() {
  const showreelRaw = await getShowreel();
  const showreelEmbed = showreelRaw ? toEmbedUrl(showreelRaw) : null;

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Videography</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Dance, festivals, parties, fashion, weddings — cinematic and artistic storytelling.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-foreground px-5 py-2 text-sm text-background hover:opacity-90 transition-opacity"
            >
              Book
            </Link>

            <Link
              href="/services"
              className="rounded-full border px-5 py-2 text-sm hover:bg-accent transition-colors"
            >
              Explore services
            </Link>

            <Link
              href="/videography/videos"
              className="rounded-full border px-5 py-2 text-sm hover:bg-accent transition-colors"
            >
              Watch videos
            </Link>
          </div>
        </div>

        {/* Showreel */}
        <section className="mt-10 overflow-hidden rounded-3xl border bg-muted">
          <div className="aspect-video w-full bg-black">
            {showreelEmbed ? (
              <iframe
                className="h-full w-full"
                src={showreelEmbed}
                title="Showreel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
                No showreel set yet — set it in Admin → Showreel
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-6">
            <div className="text-sm font-medium">Cinematic</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Film-like pacing, lighting, and composition.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <div className="text-sm font-medium">Creative</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Artistic direction with unique movement and mood.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <div className="text-sm font-medium">Quality</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Delivered clean, polished, and ready for publishing.
            </p>
          </div>
        </section>
      </main>

      <StickyCta />
    </>
  );
}