"use client";

import { useMemo, useRef } from "react";

type MediaItem = {
  id: string;
  type: string;
  title: string;
  embedUrl: string | null;
  secureUrl: string | null;
  tags: string[];
};

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

export default function VideographyClient({
  showreel,
  videos,
}: {
  showreel: MediaItem | null;
  videos: MediaItem[];
}) {
  const videosRef = useRef<HTMLDivElement | null>(null);

  const sortedVideos = useMemo(() => videos, [videos]);

  return (
    <div className="mt-10 space-y-10">
      {/* Showreel */}
      <section className="rounded-2xl border overflow-hidden">
        <div className="border-b px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Showreel</div>
            <div className="text-xs text-muted-foreground">
              {showreel?.title ?? "No showreel yet (add category: showreel in Admin → Media)"}
            </div>
          </div>

          <button
            type="button"
            onClick={() => videosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
          >
            Watch videos ↓
          </button>
        </div>

        <div className="bg-muted">
          {showreel ? (
            showreel.type === "embed" && showreel.embedUrl ? (
              <div className="relative aspect-video">
                <iframe
                  src={toEmbedUrl(showreel.embedUrl) ?? showreel.embedUrl}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={showreel.title}
                />
              </div>
            ) : showreel.type === "video" && showreel.secureUrl ? (
              <video className="h-full w-full" controls preload="metadata" src={showreel.secureUrl} />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Invalid showreel</div>
            )
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No showreel yet.
            </div>
          )}
        </div>
      </section>

      {/* Videos */}
      <section id="videos" ref={videosRef} className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Videos</h2>
            <p className="mt-1 text-sm text-muted-foreground">Scroll, click, watch.</p>
          </div>
        </div>

        {sortedVideos.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
            No videos yet. Add media category: videography in Admin → Media.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedVideos.map((v) => (
              <div key={v.id} className="rounded-2xl border overflow-hidden">
                <div className="border-b px-4 py-3 text-sm font-medium">{v.title}</div>
                <div className="bg-muted">
                  {v.type === "embed" && v.embedUrl ? (
                    <div className="relative aspect-video">
                      <iframe
                        src={toEmbedUrl(v.embedUrl) ?? v.embedUrl}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={v.title}
                      />
                    </div>
                  ) : v.type === "video" && v.secureUrl ? (
                    <video className="h-full w-full" controls preload="metadata" src={v.secureUrl} />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Invalid video</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}