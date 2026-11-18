"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { useAdminSlice } from "@/hooks/useAdminData";
import { useAddressValues } from "@/hooks/useAddressValues";
import { useDebouncedText } from "@/hooks/useDebouncedSearch";
import { leaveList, returnToRow, rowElement } from "@/lib/client/list-return";
import { GALLERY_LIST, GALLERY_LIST_PARAMS } from "./gallery-list";
import { runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { bulkResultText } from "@/components/admin/bulk/bulk-result";
import { useMediaUsageDialog } from "@/components/admin/media-usage/useMediaUsageDialog";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { useRecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { saveGuarded } from "@/lib/record-changed";
import { deleteGallery, saveGalleryWithUsageCheck } from "./save-gallery";
import type { GalleryItem, GalleryVisibility } from "./types";
import { GALLERY_MAX_ITEMS } from "@/lib/admin-data";
import { addUpTo, buildGalleryUrl, MIN_PRIVATE_GALLERY_PASSWORD_LENGTH } from "./helpers";

export function usePrivateGalleriesAdmin() {
  const [view, setView] = useState<"list" | "form">("list");
  const [items, setItems] = useAdminSlice("galleries");
  const { feedback: banner, setFeedback: setBanner, notify } = useAdminAction();
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [address, setAddress] = useAddressValues(GALLERY_LIST_PARAMS);
  const search = useDebouncedText(address.q, (q) => setAddress({ q }));
  const gallerySearch = address.q;
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [visibility, setVisibility] = useState<GalleryVisibility>("private");
  const [savedVisibility, setSavedVisibility] = useState<GalleryVisibility | null>(null);
  const [savedLinkKey, setSavedLinkKey] = useState<string | null>(null);
  const [newLink, setNewLink] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [expiresAtLocal, setExpiresAtLocal] = useState("");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const usage = useMediaUsageDialog(() => setBanner(null));
  const changed = useRecordChangedDialog(() => setBanner(null));
  const [editingVersion, setEditingVersion] = useState<string | null>(null);

  const actionBusy = saving || Boolean(deletingId);

  function resetForm() {
    setEditingId("");
    setTitle("");
    setSlug("");
    setDescription("");
    setPassword("");
    setVisibility("private");
    setSavedVisibility(null);
    setSavedLinkKey(null);
    setNewLink(false);
    setIsActive(true);
    setExpiresAtLocal("");
    setSelectedMediaIds([]);
  }

  // Opening a form keeps the list's place (lib/client/list-return.ts) and starts the form at the top.
  function showForm(rowId: string | null, row: Element | null) {
    leaveList(GALLERY_LIST, gallerySearch, rowId, row);
    setView("form");
    window.scrollTo(0, 0);
  }

  function openNew() {
    if (actionBusy) return;
    resetForm();
    showForm(null, null);
  }

  function fill(item: GalleryItem) {
    setEditingId(item.id);
    setEditingVersion(item.updatedAt);
    setTitle(item.title);
    setSlug(item.slug);
    setDescription(item.description ?? "");
    setPassword("");
    setVisibility(item.visibility);
    setSavedVisibility(item.visibility);
    setSavedLinkKey(item.linkKey);
    setNewLink(false);
    setIsActive(item.isActive);
    setExpiresAtLocal(item.expiresAtLocal ?? "");
    setSelectedMediaIds(item.mediaIds ?? []);
  }

  function openEdit(id: string, event: MouseEvent<HTMLElement>) {
    if (actionBusy) return;
    const item = items.find((gallery) => gallery.id === id);
    if (!item) return;
    setBanner(null);
    fill(item);
    showForm(id, rowElement(event.currentTarget));
  }

  function backToList() {
    if (actionBusy) return;
    resetForm();
    setView("list");
  }

  // A password is needed when the gallery is new or was public; otherwise it is optional.
  const passwordRequired = visibility === "private" && savedVisibility !== "private";

  function validateForm() {
    if (!title.trim()) return "Title is required.";

    const typed = password.trim();
    if (visibility === "private" && (passwordRequired || typed) && typed.length < MIN_PRIVATE_GALLERY_PASSWORD_LENGTH) {
      return `${passwordRequired ? "Password" : "New password"} must be at least ${MIN_PRIVATE_GALLERY_PASSWORD_LENGTH} characters.`;
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
      text: editingId ? "Updating gallery…" : "Creating gallery…",
    });

    const payload = {
      title,
      slug,
      description,
      visibility,
      password: visibility === "private" ? password : "",
      newLink: visibility === "public" && savedVisibility === "public" && newLink,
      isActive,
      expiresAtLocal,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      mediaIds: selectedMediaIds,
    };

    try {
      const result = await saveGuarded(
        editingId ? editingVersion : undefined,
        (expected) => saveGalleryWithUsageCheck(editingId, payload, usage.ask, expected),
        changed.ask,
        (current: GalleryItem) => current.updatedAt,
        (current: GalleryItem) => {
          setItems((prev) => prev.map((item) => (item.id === current.id ? current : item)));
          fill(current);
        }
      );
      if (!result) return setBanner(null);

      setSelectedMediaIds(result.mediaIds);
      if (result.outcome === "cancelled") {
        setBanner(null);
        return;
      }
      if (result.outcome === "failed") {
        setBanner({ type: "err", text: result.error });
        return;
      }

      const saved = result.item;
      // An edited gallery keeps its place in the list; a new one goes first, as the list orders them.
      setItems((prev) =>
        prev.some((item) => item.id === saved.id)
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev]
      );
      returnToRow(GALLERY_LIST, saved.id, { newRow: !editingId });
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

    const ok = confirm("Delete this gallery?");
    if (!ok) return;

    setDeletingId(id);
    setBanner({ type: "info", text: "Deleting gallery…" });

    try {
      await deleteGallery(id);
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
    if (!confirm(`Delete ${ids.length} gallery(ies)?`)) return;
    setBulkBusy(true);
    notify("info", "Deleting selected galleries…");
    const result = await runBulkAction(ids, deleteGallery);
    const titleOf = (id: string) => items.find((item) => item.id === id)?.title || "Untitled";
    setItems((prev) => prev.filter((item) => !result.okIds.includes(item.id)));
    notify(result.failed ? "err" : "ok", bulkResultText(result, "deleted", titleOf, "Delete failed."));
    setBulkBusy(false);
  }

  async function copyLink(item: GalleryItem) {
    try {
      await navigator.clipboard.writeText(buildGalleryUrl(item.slug, item.linkKey));
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

  // Adds ids in the order given until the gallery is full; returns how many were added.
  function selectMedia(ids: string[]) {
    const added = addUpTo(selectedMediaIds, ids, GALLERY_MAX_ITEMS);
    setSelectedMediaIds(added.ids);
    return added.count;
  }

  function deselectMedia(ids: string[]) {
    const remove = new Set(ids);
    setSelectedMediaIds((prev) => prev.filter((id) => !remove.has(id)));
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
    changedDialog: changed.dialog,
    items: filteredItems,
    banner,
    editingId,
    saving,
    deletingId,
    bulkBusy,
    bulkRemove,
    actionBusy,
    listView: gallerySearch,
    gallerySearchValue: search.text,
    title,
    slug,
    description,
    password,
    visibility,
    savedVisibility,
    savedLinkKey,
    newLink,
    passwordRequired,
    isActive,
    expiresAtLocal,
    selectedMediaIds,
    setGallerySearchValue: search.setText,
    clearGallerySearch: search.clear,
    setTitle,
    setSlug,
    setDescription,
    setPassword,
    setVisibility,
    setNewLink,
    setIsActive,
    setExpiresAtLocal,
    openNew,
    openEdit,
    backToList,
    save,
    remove,
    copyLink,
    toggleMedia,
    selectMedia,
    deselectMedia,
  };
}