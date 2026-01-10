import Link from "next/link";
import { StickyCta } from "@/components/site/StickyCta";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MediaItem = {
  id: string;
  type: string;
  title: string;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  secureUrl: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};

async function getVideos(): Promise<MediaItem[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/media/list-public?type=all&limit=60`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: MediaItem[] };
  const items = Array.isArray(data.items) ? data.items : [];
  return items.filter((m) => m.type === "video" || m.type === "embed");
}

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

  // YouTube (use privacy-enhanced domain)
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = u.searchParams.get("v");
    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  // youtu.be
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

  // Already an embed/player URL
  if (host === "player.vimeo.com") return input;
  if (host === "youtube-nocookie.com") return input;
  if (host === "youtube.com" && u.pathname.includes("/embed/")) return input;

  return null;
}

export default async function VideosPage() {
  const items = await getVideos();

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Videos</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Dance, festivals, parties, fashion, weddings — curated.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/videography"
              className="rounded-full border px-5 py-2 text-sm hover:bg-accent transition-colors"
            >
              Back to showreel
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-foreground px-5 py-2 text-sm text-background hover:opacity-90 transition-opacity"
            >
              Book
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border p-6 text-sm text-muted-foreground">
            No videos yet. Add uploads or YouTube/Vimeo embeds from Admin → Media.
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => {
              const cloudinarySrc = m.secureUrl ?? "";
              const rawEmbed = m.embedUrl ?? "";
              const embedSrc = rawEmbed ? toEmbedUrl(rawEmbed) : null;

              return (
                <div key={m.id} className="overflow-hidden rounded-2xl border bg-muted">
                  <div className="aspect-video w-full bg-black">
                    {m.type === "video" && cloudinarySrc ? (
                      <video className="h-full w-full object-cover" controls preload="metadata" src={cloudinarySrc} />
                    ) : embedSrc ? (
                      <iframe
                        className="h-full w-full"
                        src={embedSrc}
                        title={m.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
                        Embed URL invalid — edit it in Admin
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="text-sm font-medium">{m.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {m.year ? `${m.year}` : ""}
                      {m.location ? ` • ${m.location}` : ""}
                      {m.event ? ` • ${m.event}` : ""}
                    </div>

                    {m.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.tags.slice(0, 6).map((t) => (
                          <span
                            key={`${m.id}-${t}`}
                            className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <StickyCta />
    </>
  );
}