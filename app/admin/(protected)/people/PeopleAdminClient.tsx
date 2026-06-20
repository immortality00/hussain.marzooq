"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { AdminActionFeedback, type AdminActionFeedbackState } from "@/components/admin/action-feedback/AdminActionFeedback";
import { CLOUDINARY_PEOPLE_FOLDER } from "@/lib/cloudinary-folders";

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
  const [deletingId, setDeletingId] = useState("");
  const [banner, setBanner] = useState<AdminActionFeedbackState>(null);

  const [mode, setMode] = useState<"list" | "form">(createPrefill ? "form" : "list");
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");

  const [name, setName] = useState(createPrefill);
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const actionBusy = saving || Boolean(deletingId);

  async function load() {
    setLoading(true);
    setBanner(null);
    try {
      const res = await fetch("/api/people", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        items?: PersonItem[];
        error?: string;
      };
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
    if (actionBusy) return;
    resetForm();
    setMode("form");
  }

  function openEdit(item: PersonItem) {
    if (actionBusy) return;
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setBio(item.bio ?? "");
    setAvatarUrl(item.avatarUrl ?? "");
    setIsPublic(item.isPublic);
    setMode("form");
  }

  function backToList() {
    if (actionBusy) return;
    resetForm();
    setMode("list");
  }

  async function save() {
    if (saving) return;

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
    setBanner({ type: "info", text: editingId ? "Updating person profile…" : "Creating person profile…" });

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
        return;
      }

      setBanner({ type: "ok", text: editingId ? "✅ Person updated." : "✅ Person created." });
      await load();
      resetForm();
      setMode("list");
    } catch {
      setBanner({ type: "err", text: "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (deletingId) return;

    const ok = confirm("Delete this person profile?");
    if (!ok) return;

    setDeletingId(id);
    setBanner({ type: "info", text: "Deleting person profile…" });

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
        resetForm();
        setMode("list");
      }
    } catch {
      setBanner({ type: "err", text: "Delete failed." });
    } finally {
      setDeletingId("");
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
            disabled={actionBusy}
            onClick={openCreate}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            New profile
          </button>
        ) : (
          <button
            type="button"
            disabled={actionBusy}
            onClick={backToList}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back to list
          </button>
        )}
      </div>

      <AdminActionFeedback feedback={banner} />

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
                        disabled={actionBusy}
                        onClick={() => openEdit(item)}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() => void remove(item.id)}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === item.id ? "Deleting…" : "Delete"}
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
                disabled={actionBusy}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                placeholder="Person name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <input
                value={slug}
                disabled={actionBusy}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>

              <div className="flex flex-wrap gap-2">
                <CldUploadWidget
                  signatureEndpoint="/api/sign-cloudinary-params"
                  options={{ folder: CLOUDINARY_PEOPLE_FOLDER, multiple: false, resourceType: "image" }}
                  onSuccess={(result: unknown) => {
                    const r = result as WidgetResult;
                    const info = r?.info;
                    if (!isRecord(info)) return;
                    const secureUrl = getString(info.secure_url);
                    if (secureUrl) setAvatarUrl(secureUrl);
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => open()}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Upload avatar
                    </button>
                  )}
                </CldUploadWidget>

                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => setAvatarUrl("")}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear
                </button>
              </div>

              <input
                value={avatarUrl}
                disabled={actionBusy}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                placeholder="Avatar URL"
              />

              {avatarUrl ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-muted">
                  <Image src={avatarUrl} alt="Avatar preview" fill className="object-cover" sizes="96px" />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                disabled={actionBusy}
                onChange={(e) => setBio(e.target.value)}
                className="h-32 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                placeholder="Short public bio"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                disabled={actionBusy}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Public profile
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (editingId ? "Updating…" : "Creating…") : editingId ? "Update" : "Create"}
              </button>

              <button
                type="button"
                disabled={actionBusy}
                onClick={backToList}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
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