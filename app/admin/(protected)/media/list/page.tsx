"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AdminActionFeedback,
  type AdminActionFeedbackState,
} from "@/components/admin/action-feedback/AdminActionFeedback";
import { SearchInput } from "@/components/search/SearchInput";
import { MEDIA_CATEGORIES } from "../lib/utils";

type MediaItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  categories: string[];
  people: string[];
  nft: {
    price: number | null;
    currency: "ETH" | "SOL" | "XTZ" | "BTC";
    editionType: "1/1" | "limited" | "open";
    editionsTotal: number | null;
    editionsRemaining: number | null;
    openUntil: string | null;
    status: "available" | "sold" | "coming-soon";
    marketplaceUrl: string | null;
  } | null;
  isPublic: boolean;
  secureUrl: string | null;
  embedUrl: string | null;
  createdAt: string | null;
};

type AdminMediaListResponse = {
  ok?: boolean;
  items?: MediaItem[];
  nextCursor?: string | null;
  error?: string;
};

type LoadMode = "replace" | "append";

const SEARCH_DEBOUNCE_MS = 250;

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Unknown error";
}

function statusClasses(status: "available" | "sold" | "coming-soon") {
  if (status === "sold") {
    return "border-rose-500/30 bg-rose-500/12 text-rose-700 dark:text-rose-300";
  }

  if (status === "coming-soon") {
    return "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300";
  }

  return "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300";
}

function buildAdminMediaUrl({
  query,
  category,
  type,
  visibility,
  cursor,
}: {
  query: string;
  category: string;
  type: string;
  visibility: string;
  cursor?: string | null;
}) {
  const params = new URLSearchParams();
  params.set("limit", "60");

  const cleanQuery = query.trim();
  const cleanCategory = category.trim();
  const cleanType = type.trim();
  const cleanVisibility = visibility.trim();

  if (cleanQuery) params.set("q", cleanQuery);
  if (cleanCategory) params.set("category", cleanCategory);
  if (cleanType) params.set("type", cleanType);
  if (cleanVisibility) params.set("visibility", cleanVisibility);
  if (cursor) params.set("cursor", cursor);

  return `/api/media/admin-list?${params.toString()}`;
}

function formatNftQuantity(item: NonNullable<MediaItem["nft"]>) {
  if (item.editionType === "open") {
    return item.openUntil ? `Open until ${item.openUntil.replace("T", " ")}` : "Open edition";
  }

  const total = item.editionsTotal ?? "—";
  const remaining = item.editionsRemaining ?? "—";
  return `${remaining}/${total} remaining`;
}

export default function AdminMediaListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ?? "").trim();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [banner, setBanner] = useState<AdminActionFeedbackState>(null);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [typeFilter, setTypeFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");

  const activeFilterLabel = useMemo(() => {
    const parts = [
      query.trim() ? `search “${query.trim()}”` : "",
      categoryFilter ? `category ${categoryFilter}` : "",
      typeFilter ? `type ${typeFilter}` : "",
      visibilityFilter ? visibilityFilter : "",
    ].filter(Boolean);

    return parts.length ? parts.join(" • ") : "all media";
  }, [categoryFilter, query, typeFilter, visibilityFilter]);

  const load = useCallback(
    async (mode: LoadMode = "replace", cursor?: string | null) => {
      setBanner(null);
      if (mode === "append") setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await fetch(
          buildAdminMediaUrl({
            query,
            category: categoryFilter,
            type: typeFilter,
            visibility: visibilityFilter,
            cursor,
          }),
          { cache: "no-store" }
        );
        const data = (await res.json().catch(() => null)) as AdminMediaListResponse | null;
        if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
          setBanner({ type: "err", text: data?.error ?? "Failed to load media." });
          return;
        }

        setItems((prev) => {
          if (mode === "replace") return data.items ?? [];
          const seen = new Set(prev.map((item) => item.id));
          const fresh = (data.items ?? []).filter((item) => !seen.has(item.id));
          return [...prev, ...fresh];
        });
        setNextCursor(data.nextCursor ?? null);
      } catch (e: unknown) {
        setBanner({ type: "err", text: `Failed to load: ${getErrorMessage(e)}` });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categoryFilter, query, typeFilter, visibilityFilter]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load("replace");
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function del(id: string) {
    if (deletingId) return;

    const ok = confirm("Delete this media forever? This cannot be undone.");
    if (!ok) return;

    setDeletingId(id);
    setBanner({ type: "info", text: "Deleting media and cleaning Cloudinary asset…" });

    try {
      const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Delete failed." });
        return;
      }

      setItems((prev) => prev.filter((x) => x.id !== id));
      setBanner({ type: "ok", text: "✅ Media deleted." });
    } catch (e: unknown) {
      setBanner({ type: "err", text: `Delete error: ${getErrorMessage(e)}` });
    } finally {
      setDeletingId(null);
    }
  }

  function resetFilters() {
    setQuery("");
    setCategoryFilter("");
    setTypeFilter("");
    setVisibilityFilter("");
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Filter, edit, or delete existing media items across the full media library.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/media"
            className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            Upload new
          </Link>
          <button
            type="button"
            onClick={() => void load("replace")}
            disabled={loading || Boolean(deletingId)}
            className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>

      <AdminActionFeedback feedback={banner} />

      <section className="mt-6 rounded-2xl border p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search title, tags, people..."
            wrapperClassName="md:col-span-2"
            inputClassName="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            clearButtonClassName="mt-2 rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All categories</option>
            {MEDIA_CATEGORIES.map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All types</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="embed">Embed</option>
            </select>

            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2 md:col-span-4">
            <button
              type="button"
              onClick={resetFilters}
              disabled={Boolean(deletingId)}
              className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      <div className="mt-4 text-xs text-muted-foreground">
        Showing {items.length} result{items.length === 1 ? "" : "s"} for {activeFilterLabel}.
      </div>

      <div className="mt-8 space-y-4">
        {loading && items.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">Loading media…</div>
        ) : null}

        {!loading && items.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
            No media match these filters.
          </div>
        ) : (
          items.map((m) => {
            const deleting = deletingId === m.id;
            const actionDisabled = Boolean(deletingId);

            return (
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
                      <div className="flex h-45 items-center justify-center text-xs text-muted-foreground">
                        No preview
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-lg font-semibold">{m.title}</div>
                          {deleting ? (
                            <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                              Processing
                            </span>
                          ) : null}
                        </div>
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
                          disabled={actionDisabled}
                          onClick={() => router.push(`/admin/media?edit=${encodeURIComponent(m.id)}`)}
                          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => void del(m.id)}
                          className="rounded-xl border px-4 py-2 text-sm hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deleting ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.categories.slice(0, 10).map((c) => (
                        <span
                          key={`${m.id}-${c}`}
                          className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {c}
                        </span>
                      ))}
                      {m.nft ? (
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClasses(m.nft.status)}`}>
                          {m.nft.status}
                        </span>
                      ) : null}
                    </div>

                    {m.nft ? (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border px-2 py-0.5">{m.nft.editionType}</span>
                        <span className="rounded-full border px-2 py-0.5">{formatNftQuantity(m.nft)}</span>
                        {m.nft.price !== null ? (
                          <span className="rounded-full border px-2 py-0.5">
                            {m.nft.price} {m.nft.currency}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {m.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.tags.slice(0, 14).map((t) => (
                          <span
                            key={`${m.id}-${t}`}
                            className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-3 text-xs font-mono text-muted-foreground">ID: {m.id}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {nextCursor ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => void load("append", nextCursor)}
            disabled={loadingMore || Boolean(deletingId)}
            className="rounded-full border px-5 py-2 text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </main>
  );
}