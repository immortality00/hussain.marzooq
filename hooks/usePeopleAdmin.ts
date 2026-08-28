"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { useAdminAction } from "./useAdminAction";

export type PersonVisibility = "public" | "private" | "hidden";

export type PersonItem = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  isPrivate: boolean;
  hasPassword: boolean;
  removalRequestedAt: string | null;
  removalApprovedAt: string | null;
};

function toVisibility(item: Pick<PersonItem, "isPublic" | "isPrivate">): PersonVisibility {
  if (item.isPublic === false) return "hidden";
  if (item.isPrivate) return "private";
  return "public";
}

export function usePeopleAdmin() {
  const searchParams = useSearchParams();
  const createPrefill = (searchParams.get("create") ?? "").trim();

  const [items, setItems] = useState<PersonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const { feedback: banner, setFeedback: setBanner } = useAdminAction();

  const [mode, setMode] = useState<"list" | "form">(createPrefill ? "form" : "list");
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");

  const [name, setName] = useState(createPrefill);
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [visibility, setVisibility] = useState<PersonVisibility>("public");
  const [password, setPassword] = useState("");
  const [editingHasPassword, setEditingHasPassword] = useState(false);
  const [editingRemovalApprovedAt, setEditingRemovalApprovedAt] = useState<string | null>(null);

  const actionBusy = saving || Boolean(deletingId);

  const load = useCallback(async () => {
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
  }, [setBanner]);

  useEffect(() => { void load(); }, [load]);

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
    setVisibility("public");
    setPassword("");
    setEditingHasPassword(false);
    setEditingRemovalApprovedAt(null);
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
    setVisibility(toVisibility(item));
    setPassword("");
    setEditingHasPassword(item.hasPassword);
    setEditingRemovalApprovedAt(item.removalApprovedAt);
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

    if (visibility === "private" && !editingHasPassword && !password.trim()) {
      setBanner({ type: "err", text: "Set a password for a password-protected profile." });
      return;
    }

    setSaving(true);
    setBanner({ type: "info", text: editingId ? "Updating person profile…" : "Creating person profile…" });

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      isPublic: visibility !== "hidden",
      isPrivate: visibility === "private",
      password: password.trim(),
    };

    try {
      const res = await fetch(
        editingId ? `/api/people/${encodeURIComponent(editingId)}` : "/api/people",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

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

  async function bulkRemove(ids: string[]) {
    if (bulkBusy || ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} person profile(s)?`)) return;
    setBulkBusy(true);
    setBanner({ type: "info", text: "Deleting selected profiles…" });
    const { ok, failed, okIds } = await runBulkAction(ids, async (id) => {
      const res = await fetch(`/api/people/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean };
      if (!res.ok || !data?.ok) throw new Error();
    });
    setItems((prev) => prev.filter((x) => !okIds.includes(x.id)));
    setBanner({ type: failed ? "err" : "ok", text: `${ok} deleted${failed ? `, ${failed} failed` : ""}.` });
    setBulkBusy(false);
  }

  return {
    items: filtered,
    loading,
    saving,
    deletingId,
    bulkBusy,
    bulkRemove,
    actionBusy,
    banner,
    mode,
    editingId,
    query,
    name,
    slug,
    bio,
    avatarUrl,
    visibility,
    password,
    editingHasPassword,
    editingRemovalApprovedAt,
    setQuery,
    setName,
    setSlug,
    setBio,
    setAvatarUrl,
    setVisibility,
    setPassword,
    openCreate,
    openEdit,
    backToList,
    save,
    remove,
  };
}
