"use client";

import { useEffect, useMemo, useState } from "react";

type PersonItem = {
  id: string;
  name: string;
  slug: string;
  headline: string | null;
  bio: string | null;
  aliases: string[];
  avatarUrl: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

function toAliases(value: string) {
  return value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function PeopleAdminClient() {
  const [items, setItems] = useState<PersonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [aliasesText, setAliasesText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  async function load() {
    setLoading(true);
    setBanner(null);
    try {
      const res = await fetch("/api/people", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; items?: PersonItem[]; error?: string };
      if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
        setBanner({ type: "err", text: data?.error ?? "Failed to load people." });
        return;
      }
      setItems(data.items);
    } catch {
      setBanner({ type: "err", text: "Failed to load people." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.name} ${item.slug} ${item.headline ?? ""} ${item.aliases.join(" ")}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  function resetForm() {
    setEditingId("");
    setName("");
    setSlug("");
    setHeadline("");
    setBio("");
    setAliasesText("");
    setAvatarUrl("");
    setCoverUrl("");
    setIsPublic(true);
  }

  function loadIntoForm(item: PersonItem) {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setHeadline(item.headline ?? "");
    setBio(item.bio ?? "");
    setAliasesText(item.aliases.join(", "));
    setAvatarUrl(item.avatarUrl ?? "");
    setCoverUrl(item.coverUrl ?? "");
    setIsPublic(item.isPublic);
  }

  async function save() {
    setBanner(null);

    if (!name.trim()) {
      setBanner({ type: "err", text: "Name is required." });
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      aliases: toAliases(aliasesText),
      avatarUrl: avatarUrl.trim(),
      coverUrl: coverUrl.trim(),
      isPublic,
    };

    try {
      const res = await fetch(editingId ? `/api/people/${encodeURIComponent(editingId)}` : "/api/people", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Save failed." });
        return;
      }

      setBanner({ type: "ok", text: editingId ? "✅ Person updated." : "✅ Person created." });
      resetForm();
      await load();
    } catch {
      setBanner({ type: "err", text: "Save failed." });
    }
  }

  async function remove(id: string) {
    const ok = confirm("Delete this person profile?");
    if (!ok) return;

    setBanner(null);
    try {
      const res = await fetch(`/api/people/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Delete failed." });
        return;
      }

      if (editingId === id) resetForm();
      setItems((prev) => prev.filter((x) => x.id !== id));
      setBanner({ type: "ok", text: "✅ Person deleted." });
    } catch {
      setBanner({ type: "err", text: "Delete failed." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">People</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create public people profiles and connect them to media through tagged people names.
          </p>
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
        >
          New profile
        </button>
      </div>

      {banner ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            banner.type === "ok" ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl border p-5">
          <div className="text-sm font-medium">{editingId ? "Edit profile" : "New profile"}</div>

          <div className="mt-5 grid gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug (optional)"
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Headline"
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
              className="min-h-32 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <input
              value={aliasesText}
              onChange={(e) => setAliasesText(e.target.value)}
              placeholder="Aliases, comma separated"
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Avatar URL"
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="Cover URL"
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Public
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void save()}
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
              >
                {editingId ? "Update" : "Create"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">Profiles</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No people profiles yet.</div>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="rounded-2xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{item.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        /people/{item.slug} • {item.isPublic ? "Public" : "Private"}
                      </div>
                      {item.headline ? (
                        <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.headline}</div>
                      ) : null}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => loadIntoForm(item)}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(item.id)}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {item.aliases.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.aliases.map((alias) => (
                        <span key={`${item.id}-${alias}`} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                          {alias}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}