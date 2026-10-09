"use client";

import { useMemo, useState } from "react";
import { useAdminSlice } from "@/hooks/useAdminData";
import { useSearchParams } from "next/navigation";
import { runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { bulkResultText } from "@/components/admin/bulk/bulk-result";
import { useRecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { saveGuarded } from "@/lib/record-changed";
import { deletePerson, savePerson } from "@/app/admin/(protected)/people/lib/api";
import { errorMessage, useAdminAction } from "./useAdminAction";
import { cleanupUploadedAsset } from "@/lib/client/cleanup-uploaded-asset";
import { useLatest } from "./useLatest";

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
  updatedAt: string | null;
};

function toVisibility(item: Pick<PersonItem, "isPublic" | "isPrivate">): PersonVisibility {
  if (item.isPublic === false) return "hidden";
  if (item.isPrivate) return "private";
  return "public";
}

export function usePeopleAdmin() {
  const searchParams = useSearchParams();
  const createPrefill = (searchParams.get("create") ?? "").trim();

  const [items, setItems] = useAdminSlice("people");
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
  const [editingVersion, setEditingVersion] = useState<string | null>(null);
  const changed = useRecordChangedDialog(() => setBanner(null));

  const latestAvatarUrl = useLatest(avatarUrl);

  const actionBusy = saving || Boolean(deletingId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.name} ${item.slug} ${item.bio ?? ""}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  function resetForm() {
    setEditingId("");
    setName("");
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

  function discardCurrentAvatar() {
    if (latestAvatarUrl.current) cleanupUploadedAsset({ url: latestAvatarUrl.current });
  }

  function uploadAvatar(u: { secureUrl: string }) {
    discardCurrentAvatar();
    setAvatarUrl(u.secureUrl);
  }

  function clearAvatar() {
    discardCurrentAvatar();
    setAvatarUrl("");
  }

  function fill(item: PersonItem) {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setBio(item.bio ?? "");
    setAvatarUrl(item.avatarUrl ?? "");
    setVisibility(toVisibility(item));
    setPassword("");
    setEditingHasPassword(item.hasPassword);
    setEditingRemovalApprovedAt(item.removalApprovedAt);
    setEditingVersion(item.updatedAt);
    setMode("form");
  }

  function openEdit(item: PersonItem) {
    if (!actionBusy) fill(item);
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
      const item = editingId
        ? await saveGuarded(
            editingVersion,
            (expected) => savePerson(editingId, payload, expected),
            changed.ask,
            (current: PersonItem) => current.updatedAt,
            (current: PersonItem) => {
              setItems((prev) => prev.map((x) => (x.id === current.id ? current : x)));
              fill(current);
            }
          )
        : await savePerson("", payload);
      if (!item) return setBanner(null);

      setItems((prev) => [item, ...prev.filter((x) => x.id !== item.id)]);
      setBanner({ type: "ok", text: editingId ? "✅ Person updated." : "✅ Person created." });
      resetForm();
      setMode("list");
    } catch (e: unknown) {
      setBanner({ type: "err", text: errorMessage(e, "Save failed.") });
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
      await deletePerson(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setBanner({ type: "ok", text: "✅ Person deleted." });

      if (editingId === id) {
        resetForm();
        setMode("list");
      }
    } catch (e: unknown) {
      setBanner({ type: "err", text: errorMessage(e, "Delete failed.") });
    } finally {
      setDeletingId("");
    }
  }

  async function bulkRemove(ids: string[]) {
    if (bulkBusy || ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} person profile(s)?`)) return;
    setBulkBusy(true);
    setBanner({ type: "info", text: "Deleting selected profiles…" });
    const result = await runBulkAction(ids, deletePerson);
    setItems((prev) => prev.filter((x) => !result.okIds.includes(x.id)));
    const labelOf = (id: string) => items.find((x) => x.id === id)?.name || "Person";
    setBanner({ type: result.failed ? "err" : "ok", text: bulkResultText(result, "deleted", labelOf) });
    setBulkBusy(false);
  }

  return {
    items: filtered,
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
    uploadAvatar,
    clearAvatar,
    setVisibility,
    setPassword,
    openCreate,
    openEdit,
    backToList,
    save,
    remove,
    changedDialog: changed.dialog,
  };
}
