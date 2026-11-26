"use client";

import { useState } from "react";
import { useDraftOrder } from "@/hooks/useDraftOrder";
import { useAdminSlice } from "@/hooks/useAdminData";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { useBulkRunner } from "@/components/admin/bulk/useBulkRunner";
import { CANNOT_UNDO, deleteQuestion, useConfirmDialog } from "@/components/admin/choice-dialog/ConfirmDialog";
import { countOf } from "@/lib/plural";
import { createTagRequest, deleteTagRequest, patchTag } from "./api";
import type { NewTag, Tag, TagPatch } from "./types";

const EMPTY_DRAFT: NewTag = { label: "", slug: "", description: "" };

export function useTagActions() {
  const [items, setItems] = useAdminSlice("mediaTags");
  const [draft, setDraft] = useState<NewTag>(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const { feedback, setFeedback } = useAdminAction();
  const confirmation = useConfirmDialog(() => setFeedback(null));
  const { ordered, move, save } = useDraftOrder(items, setItems);

  const actionBusy = creating || savingOrder;
  const labelOf = (id: string) => items.find((t) => t.id === id)?.label ?? "Tag";
  const fail = (e: unknown) => setFeedback({ type: "err", text: errorMessage(e) });
  const { selection, busy: bulkBusy, run: runBulk } = useBulkRunner(ordered.map((t) => t.id), labelOf, setFeedback);

  const bulkSetActive = (value: boolean) =>
    runBulk(
      value ? "Activating selected…" : "Hiding selected…",
      value ? "activated" : "hidden",
      (id) => patchTag(id, { isActive: value }),
      (okIds) => setItems((prev) => prev.map((t) => (okIds.includes(t.id) ? { ...t, isActive: value } : t)))
    );

  async function bulkDelete() {
    const one = selection.count === 1;
    const detail = `${one ? "It comes off any media it's" : "They come off any media they're"} on. The media stays.`;
    const question = deleteQuestion(countOf(selection.count, "tag"), detail);
    if (!(await confirmation.ask(question))) return;
    return runBulk("Deleting selected tags…", "deleted", (id) => deleteTagRequest(id, true), (okIds) =>
      setItems((prev) => prev.filter((t) => !okIds.includes(t.id)))
    );
  }

  async function createTag() {
    if (actionBusy) return;
    const label = draft.label.trim();
    if (!label) return setFeedback({ type: "err", text: "Label is required." });

    setCreating(true);
    setFeedback({ type: "info", text: "Creating tag…" });
    try {
      const created = await createTagRequest({ ...draft, label });
      setItems((prev) => [...prev.filter((t) => t.id !== created.id), created]);
      setDraft(EMPTY_DRAFT);
      setFeedback({ type: "ok", text: "Tag created." });
    } catch (e: unknown) {
      fail(e);
    } finally {
      setCreating(false);
    }
  }

  async function updateTag(id: string, patch: TagPatch, busyText: string, okText: string) {
    if (actionBusy) return false;
    setFeedback({ type: "info", text: busyText });
    try {
      await patchTag(id, patch);
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      setFeedback({ type: "ok", text: okText });
      return true;
    } catch (e: unknown) {
      fail(e);
      return false;
    }
  }

  const editTag = (id: string, patch: TagPatch) => updateTag(id, patch, "Updating tag…", "Tag updated.");
  const toggleTag = (id: string, value: boolean) =>
    updateTag(id, { isActive: value }, value ? "Activating tag…" : "Hiding tag…", value ? "Tag activated." : "Tag hidden.");

  async function deleteTag(tag: Tag) {
    if (actionBusy) return;
    setFeedback(null);
    const detach = tag.mediaCount > 0;
    const detail = detach ? `It comes off ${countOf(tag.mediaCount, "media item")}. The media stays.` : CANNOT_UNDO;
    if (!(await confirmation.ask(deleteQuestion(`“${tag.label}”`, detail)))) return;

    setFeedback({ type: "info", text: `Deleting tag “${tag.label}”…` });
    try {
      await deleteTagRequest(tag.id, detach);
      setItems((prev) => prev.filter((t) => t.id !== tag.id));
      setFeedback({ type: "ok", text: "Tag deleted." });
    } catch (e: unknown) {
      fail(e);
    }
  }

  async function saveOrder() {
    if (actionBusy) return;
    setSavingOrder(true);
    setFeedback({ type: "info", text: "Saving tag order…" });
    try {
      await save((id, order) => patchTag(id, { order }));
      setFeedback({ type: "ok", text: "Order saved." });
    } catch (e: unknown) {
      fail(e);
    } finally {
      setSavingOrder(false);
    }
  }

  function onReorder(activeId: string, overId: string) {
    if (!actionBusy) move(activeId, overId);
  }

  return {
    ordered, draft, setDraft, creating, savingOrder, actionBusy, feedback, selection, bulkBusy,
    bulkSetActive, bulkDelete, createTag, editTag, toggleTag, deleteTag, saveOrder, onReorder,
    confirmDialog: confirmation.dialog,
  };
}
