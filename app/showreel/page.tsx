import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";
import { getBaseUrl } from "@/lib/server/get-base-url";

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

  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    if (!id) return null;
    return `https://player.vimeo.com/video/${id}`;
  }

  if (host === "player.vimeo.com") return input;
  if (host === "youtube-nocookie.com") return input;
  if (host === "youtube.com" && u.pathname.includes("/embed/")) return input;

  return null;
}

async function getShowreel(): Promise<string | null> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/site-settings/showreel`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { embedUrl?: string | null };
  return typeof data.embedUrl === "string" ? data.embedUrl : null;
}

export default async function ShowreelPage() {
  const showreelRaw = await getShowreel();
  const showreelEmbed = showreelRaw ? toEmbedUrl(showreelRaw) : null;

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Showreel</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">A cinematic overview of my videography work.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-foreground px-5 py-2 text-sm text-background hover:opacity-90 transition-opacity"
            >
              Book
            </Link>
            <Link
              href="/videography"
              className="rounded-full border px-5 py-2 text-sm hover:bg-accent transition-colors"
            >
              Videography
            </Link>
          </div>
        </div>

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
      </main>

      <StickyCta />
    </>
  );
}