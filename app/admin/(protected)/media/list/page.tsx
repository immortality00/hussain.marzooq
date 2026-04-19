"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MediaItem = {
  id: string;
  type: string;
  title: string;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories: string[];
  people: string[];
  isPublic: boolean;
  secureUrl: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Unknown error";
}

export default function AdminMediaListPage() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function load() {
    setBanner(null);
    setLoading(true);
    try {
      const res = await fetch("/api/media/admin-list?limit=120", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; items?: MediaItem[]; error?: string };
      if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
        setBanner({ type: "err", text: data?.error ?? "Failed to load media." });
        return;
      }
      setItems(data.items);
    } catch (e: unknown) {
      setBanner({ type: "err", text: `Failed to load: ${getErrorMessage(e)}` });
    } finally {
      setLoading(false);
    }
  }

  async function del(id: string) {
    const ok = confirm("Delete this media forever? This cannot be undone.");
    if (!ok) return;

    setBanner(null);
    try {
      const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Delete failed." });
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== id));
      setBanner({ type: "ok", text: "✅ Deleted." });
    } catch (e: unknown) {
      setBanner({ type: "err", text: `Delete error: ${getErrorMessage(e)}` });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
          <p className="mt-2 text-sm text-muted-foreground">Edit or delete existing media items.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/media" className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors">
            Upload new
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>

      {banner ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === "ok" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">No media yet.</div>
        ) : (
          items.map((m) => (
            <div key={m.id} className="rounded-2xl border p-5">
              <div className="grid gap-4 md:grid-cols-[240px_1fr]">
                <div className="overflow-hidden rounded-2xl border bg-muted">
                  {m.secureUrl ? (
                    m.type === "video" ? (
                      <video className="h-full w-full" controls preload="metadata" src={m.secureUrl} />
                    ) : (
                      <div className="relative aspect-4/3">
                        <Image src={m.secureUrl} alt={m.title} fill className="object-cover" sizes="240px" />
                      </div>
                    )
                  ) : (
                    <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">
                      No preview
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-semibold">{m.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {m.type} • {m.isPublic ? "Public" : "Private"}
                        {m.year ? ` • ${m.year}` : ""}
                        {m.location ? ` • ${m.location}` : ""}
                        {m.event ? ` • ${m.event}` : ""}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/media?edit=${encodeURIComponent(m.id)}`)}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void del(m.id)}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {m.categories?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.categories.slice(0, 10).map((c) => (
                        <span key={`${m.id}-${c}`} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-muted-foreground">No categories</div>
                  )}

                  {m.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.tags.slice(0, 14).map((t) => (
                        <span key={`${m.id}-${t}`} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 text-xs text-muted-foreground font-mono">ID: {m.id}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}