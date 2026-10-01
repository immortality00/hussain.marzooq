"use client";

import { useCallback, useMemo, useState } from "react";
import { useAdminSlice } from "@/hooks/useAdminData";
import { runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { bulkResultText } from "@/components/admin/bulk/bulk-result";
import { useMediaUsageDialog } from "@/components/admin/media-usage/useMediaUsageDialog";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { saveGalleryWithUsageCheck } from "./save-gallery";
import type { GalleryItem } from "./types";
import { buildGalleryUrl, MIN_PRIVATE_GALLERY_PASSWORD_LENGTH } from "./helpers";

export function usePrivateGalleriesAdmin() {
  const [view, setView] = useState<"list" | "form">("list");
  const [items, setItems] = useAdminSlice("galleries");
  const { feedback: banner, setFeedback: setBanner, notify } = useAdminAction();
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [gallerySearch, setGallerySearch] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [expiresAtLocal, setExpiresAtLocal] = useState("");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const usage = useMediaUsageDialog(() => setBanner(null));

  const actionBusy = saving || Boolean(deletingId);

  const loadGalleries = useCallback(async () => {
    const res = await fetch("/api/private-galleries", { cache: "no-store" }).catch(() => null);
    const data = res?.ok ? ((await res.json().catch(() => null)) as { ok?: boolean; items?: GalleryItem[] } | null) : null;
    if (data?.ok && Array.isArray(data.items)) setItems(data.items);
  }, [setItems]);

  function resetForm() {
    setEditingId("");
    setTitle("");
    setSlug("");
    setDescription("");
    setPassword("");
    setIsActive(true);
    setExpiresAtLocal("");
    setSelectedMediaIds([]);
  }

  function openNew() {
    if (actionBusy) return;
    resetForm();
    setView("form");
  }

  function openEdit(id: string) {
    if (actionBusy) return;
    const item = items.find((gallery) => gallery.id === id);
    if (!item) return;

    setBanner(null);
    setEditingId(item.id);
    setTitle(item.title);
    setSlug(item.slug);
    setDescription(item.description ?? "");
    setPassword("");
    setIsActive(item.isActive);
    setExpiresAtLocal(item.expiresAtLocal ?? "");
    setSelectedMediaIds(item.mediaIds ?? []);
    setView("form");
  }

  function backToList() {
    if (actionBusy) return;
    resetForm();
    setView("list");
  }

  function validateForm() {
    if (!title.trim()) return "Title is required.";

    if (!editingId && password.trim().length < MIN_PRIVATE_GALLERY_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PRIVATE_GALLERY_PASSWORD_LENGTH} characters.`;
    }

    if (
      editingId &&
      password.trim() &&
      password.trim().length < MIN_PRIVATE_GALLERY_PASSWORD_LENGTH
    ) {
      return `New password must be at least ${MIN_PRIVATE_GALLERY_PASSWORD_LENGTH} characters.`;
    }

    if (!expiresAtLocal.trim()) return "Expiry date is required.";
    if (selectedMediaIds.length === 0) return "Select at least one media item.";

    return null;
  }

  async function save() {
    if (saving) return;

    setBanner(null);

    const validationError = validateForm();
    if (validationError) {
      setBanner({ type: "err", text: validationError });
      return;
    }

    setSaving(true);
    setBanner({
      type: "info",
      text: editingId ? "Updating private gallery…" : "Creating private gallery…",
    });

    try {
      const result = await saveGalleryWithUsageCheck(
        editingId,
        {
          title,
          slug,
          description,
          password,
          isActive,
          expiresAtLocal,
          timezoneOffsetMinutes: new Date().getTimezoneOffset(),
          mediaIds: selectedMediaIds,
        },
        usage.ask
      );

      setSelectedMediaIds(result.mediaIds);
      if (result.outcome === "cancelled") {
        setBanner(null);
        return;
      }
      if (result.outcome === "failed") {
        setBanner({ type: "err", text: result.error });
        return;
      }

      await loadGalleries();
      setBanner({ type: "ok", text: editingId ? "✅ Gallery updated." : "✅ Gallery created." });
      backToList();
    } catch (e: unknown) {
      notify("err", errorMessage(e, "Save failed."));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (deletingId) return;

    const ok = confirm("Delete this private gallery?");
    if (!ok) return;

    setDeletingId(id);
    setBanner({ type: "info", text: "Deleting private gallery…" });

    try {
      const res = await fetch(`/api/private-galleries/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Delete failed." });
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setBanner({ type: "ok", text: "✅ Gallery deleted." });

      if (editingId === id) backToList();
    } catch (e: unknown) {
      notify("err", errorMessage(e, "Delete failed."));
    } finally {
      setDeletingId(null);
    }
  }

  async function bulkRemove(ids: string[]) {
    if (bulkBusy || ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} private gallery(ies)?`)) return;
    setBulkBusy(true);
    notify("info", "Deleting selected galleries…");
    const result = await runBulkAction(ids, async (id) => {
      const res = await fetch(`/api/private-galleries/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Delete failed.");
    });
    const titleOf = (id: string) => items.find((item) => item.id === id)?.title || "Untitled";
    setItems((prev) => prev.filter((item) => !result.okIds.includes(item.id)));
    notify(result.failed ? "err" : "ok", bulkResultText(result, "deleted", titleOf, "Delete failed."));
    setBulkBusy(false);
  }

  async function copyLink(slugValue: string) {
    try {
      await navigator.clipboard.writeText(buildGalleryUrl(slugValue));
      setBanner({ type: "ok", text: "✅ Gallery link copied." });
    } catch {
      setBanner({ type: "err", text: "Failed to copy gallery link." });
    }
  }

  function toggleMedia(id: string) {
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  }

  const filteredItems = useMemo(() => {
    const q = gallerySearch.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) =>
      `${item.title} ${item.slug} ${item.description ?? ""}`.toLowerCase().includes(q)
    );
  }, [gallerySearch, items]);

  return {
    view,
    usageDialog: usage.dialog,
    items: filteredItems,
    banner,
    editingId,
    saving,
    deletingId,
    bulkBusy,
    bulkRemove,
    actionBusy,
    gallerySearchValue: gallerySearch,
    title,
    slug,
    description,
    password,
    isActive,
    expiresAtLocal,
    selectedMediaIds,
    setGallerySearchValue: setGallerySearch,
    clearGallerySearch: () => setGallerySearch(""),
    setTitle,
    setSlug,
    setDescription,
    setPassword,
    setIsActive,
    setExpiresAtLocal,
    openNew,
    openEdit,
    backToList,
    save,
    remove,
    copyLink,
    toggleMedia,
  };
}