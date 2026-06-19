"use client";

import { useEffect, useMemo, useState } from "react";
import type { BannerState, GalleryItem } from "./types";
import { buildGalleryUrl, MIN_PRIVATE_GALLERY_PASSWORD_LENGTH } from "./helpers";

export function usePrivateGalleriesAdmin() {
  const [view, setView] = useState<"list" | "form">("list");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [gallerySearch, setGallerySearch] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [expiresAtLocal, setExpiresAtLocal] = useState("");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  const actionBusy = saving || Boolean(deletingId);

  async function loadGalleries() {
    setLoading(true);
    setBanner(null);

    try {
      const res = await fetch("/api/private-galleries", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        items?: GalleryItem[];
        error?: string;
      } | null;

      if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
        setBanner({ type: "err", text: data?.error ?? "Failed to load galleries." });
        return;
      }

      setItems(data.items);
    } catch {
      setBanner({ type: "err", text: "Failed to load private galleries." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGalleries();
  }, []);

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

  async function openEdit(id: string) {
    if (actionBusy) return;

    setBanner(null);

    try {
      const res = await fetch(`/api/private-galleries/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        item?: GalleryItem;
        error?: string;
      } | null;

      if (!res.ok || !data?.ok || !data.item) {
        setBanner({ type: "err", text: data?.error ?? "Failed to load gallery." });
        return;
      }

      setEditingId(data.item.id);
      setTitle(data.item.title);
      setSlug(data.item.slug);
      setDescription(data.item.description ?? "");
      setPassword("");
      setIsActive(data.item.isActive);
      setExpiresAtLocal(data.item.expiresAtLocal ?? "");
      setSelectedMediaIds(data.item.mediaIds ?? []);
      setView("form");
    } catch {
      setBanner({ type: "err", text: "Failed to load gallery." });
    }
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
      const res = await fetch(
        editingId
          ? `/api/private-galleries/${encodeURIComponent(editingId)}`
          : "/api/private-galleries",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            slug,
            description,
            password,
            isActive,
            expiresAtLocal,
            timezoneOffsetMinutes: new Date().getTimezoneOffset(),
            mediaIds: selectedMediaIds,
          }),
        }
      );

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Save failed." });
        return;
      }

      setBanner({ type: "ok", text: editingId ? "✅ Gallery updated." : "✅ Gallery created." });
      await loadGalleries();
      backToList();
    } catch {
      setBanner({ type: "err", text: "Save failed." });
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
    } catch {
      setBanner({ type: "err", text: "Delete failed." });
    } finally {
      setDeletingId(null);
    }
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
    items: filteredItems,
    loading,
    banner,
    editingId,
    saving,
    deletingId,
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