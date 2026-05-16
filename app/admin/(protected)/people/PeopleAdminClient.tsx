"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

type WidgetResult = { info?: unknown };

type PersonItem = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export default function PeopleAdminClient() {
  const searchParams = useSearchParams();
  const createPrefill = (searchParams.get("create") ?? "").trim();

  const [items, setItems] = useState<PersonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [mode, setMode] = useState<"list" | "form">(createPrefill ? "form" : "list");
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");

  const [name, setName] = useState(createPrefill);
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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

  useEffect(() => {
    if (!editingId && createPrefill) {
      setName(createPrefill);
      setMode("form");
    }
  }, [createPrefill, editingId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.name} ${item.slug} ${item.bio ?? ""}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  function resetForm() {
    setEditingId("");
    setName(createPrefill);
    setSlug("");
    setBio("");
    setAvatarUrl("");
    setIsPublic(true);
  }

  function openCreate() {
    resetForm();
    setMode("form");
  }

  function openEdit(item: PersonItem) {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setBio(item.bio ?? "");
    setAvatarUrl(item.avatarUrl ?? "");
    setIsPublic(item.isPublic);
    setMode("form");
  }

  function backToList() {
    resetForm();
    setMode("list");
  }

  async function save() {
    setBanner(null);

    if (!name.trim()) {
      setBanner({ type: "err", text: "Name is required." });
      return;
    }

    if (!avatarUrl.trim()) {
      setBanner({ type: "err", text: "Avatar is required." });
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
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
        setSaving(false);
        return;
      }

      setBanner({ type: "ok", text: editingId ? "✅ Person updated." : "✅ Person created." });
      await load();
      backToList();
    } catch {
      setBanner({ type: "err", text: "Save failed." });
    } finally {
      setSaving(false);
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

      setItems((prev) => prev.filter((x) => x.id !== id));
      setBanner({ type: "ok", text: "✅ Person deleted." });

      if (editingId === id) {
        backToList();
      }
    } catch {
      setBanner({ type: "err", text: "Delete failed." });
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">People</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create clean people profiles and link them from media using existing profiles only.
          </p>
        </div>

        {mode === "list" ? (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            New profile
          </button>
        ) : (
          <button
            type="button"
            onClick={backToList}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Back to list
          </button>
        )}
      </div>

      {banner ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === "ok" ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

      {mode === "list" ? (
        <section className="mt-8 rounded-[2rem] border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">Profiles</div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search profiles..."
              className="w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No profiles yet.</div>
            ) : (
              filtered.map((item) => (
                <article key={item.id} className="rounded-[2rem] border p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border bg-muted">
                      {item.avatarUrl ? (
                        <Image src={item.avatarUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{item.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        /people/{item.slug} • {item.isPublic ? "Public" : "Private"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
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
                </article>
              ))
            )}
          </div>
        </section>
      ) : (
        <section className="mt-8 mx-auto max-w-2xl rounded-[2rem] border p-5">
          <div className="text-sm font-medium">{editingId ? "Edit person" : "Create person"}</div>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Person name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>

              <div className="flex flex-wrap gap-2">
                <CldUploadWidget
                  signatureEndpoint="/api/sign-cloudinary-params"
                  options={{
                    folder: "hm_visuals/people",
                    multiple: false,
                    resourceType: "image",
                    cropping: true,
                    croppingAspectRatio: 1,
                    showSkipCropButton: false,
                  }}
                  onSuccess={(result: unknown) => {
                    const info = (result as WidgetResult)?.info;
                    if (!isRecord(info)) return;
                    const secureUrl = getString(info.secure_url);
                    if (secureUrl) setAvatarUrl(secureUrl);
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      Upload & crop avatar
                    </button>
                  )}
                </CldUploadWidget>

                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Clear
                </button>
              </div>

              {avatarUrl ? (
                <div className="flex justify-center pt-2">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full border bg-muted">
                    <Image src={avatarUrl} alt="Avatar preview" fill className="object-cover" sizes="112px" />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                  No avatar uploaded yet.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-32 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Optional"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Public
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>

              <button
                type="button"
                onClick={backToList}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}