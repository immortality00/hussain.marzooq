"use client";

import { useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useBulkSelection, runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import TagFormCard from "./components/TagFormCard";
import TagsTable from "./components/TagsTable";
import TagsToolbar from "./components/TagsToolbar";
import { createTagRequest, deleteTagRequest, fetchTags, patchTag } from "./lib/api";
import type { NewTag, Tag, TagPatch } from "./lib/types";
import { getErrorMessage } from "./lib/utils";

const EMPTY_DRAFT: NewTag = { label: "", slug: "", description: "" };

export default function AdminTagsClient({ initial }: { initial: Tag[] }) {
  const [items, setItems] = useState<Tag[]>(initial);
  const [draft, setDraft] = useState<NewTag>(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const { feedback, setFeedback } = useAdminAction();

  const actionBusy = creating || savingOrder;

  const ordered = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  const selection = useBulkSelection(ordered.map((t) => t.id));
  const [bulkBusy, setBulkBusy] = useState(false);

  async function bulkSetActive(value: boolean) {
    if (bulkBusy || selection.count === 0) return;
    const ids = selection.selectedIds;
    setBulkBusy(true);
    setFeedback({ type: "info", text: value ? "Activating selected…" : "Hiding selected…" });
    const { ok, failed } = await runBulkAction(ids, (id) => patchTag(id, { isActive: value }));
    setFeedback({
      type: failed ? "err" : "ok",
      text: `${ok} ${value ? "activated" : "hidden"}${failed ? `, ${failed} failed` : ""}.`,
    });
    selection.clear();
    await refresh();
    setBulkBusy(false);
  }

  async function bulkDelete() {
    if (bulkBusy || selection.count === 0) return;
    if (
      !confirm(
        `Delete ${selection.count} tag(s) forever?\n\nAny still on media will be detached (the media stays).`,
      )
    )
      return;
    const ids = selection.selectedIds;
    setBulkBusy(true);
    setFeedback({ type: "info", text: "Deleting selected tags…" });
    const { ok, failed } = await runBulkAction(ids, (id) => deleteTagRequest(id, true));
    setFeedback({ type: failed ? "err" : "ok", text: `${ok} deleted${failed ? `, ${failed} failed` : ""}.` });
    selection.clear();
    await refresh();
    setBulkBusy(false);
  }

  async function refresh() {
    try {
      const next = await fetchTags();
      setItems(next);
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
    }
  }

  async function createTag() {
    if (actionBusy) return;

    const label = draft.label.trim();
    if (!label) {
      setFeedback({ type: "err", text: "Label is required." });
      return;
    }

    setCreating(true);
    setFeedback({ type: "info", text: "Creating tag…" });

    try {
      await createTagRequest({ ...draft, label });
      setDraft(EMPTY_DRAFT);
      await refresh();
      setFeedback({ type: "ok", text: "✅ Tag created." });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
    } finally {
      setCreating(false);
    }
  }

  async function editTag(id: string, patch: TagPatch) {
    if (actionBusy) return;

    setFeedback({ type: "info", text: "Updating tag…" });

    try {
      await patchTag(id, patch);
      setItems((prev) => prev.map((t) => (t.id === id ? ({ ...t, ...patch } as Tag) : t)));
      setFeedback({ type: "ok", text: "✅ Tag updated." });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
      await refresh();
    }
  }

  async function toggleTag(id: string, value: boolean) {
    if (actionBusy) return;

    setFeedback({ type: "info", text: value ? "Activating tag…" : "Hiding tag…" });

    try {
      await patchTag(id, { isActive: value });
      setItems((prev) => prev.map((t) => (t.id === id ? ({ ...t, isActive: value } as Tag) : t)));
      setFeedback({ type: "ok", text: value ? "✅ Tag activated." : "✅ Tag hidden." });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
    }
  }

  async function deleteTag(tag: Tag) {
    if (actionBusy) return;

    setFeedback(null);

    let detach = false;
    if (tag.mediaCount > 0) {
      const ok = confirm(
        `"${tag.label}" is on ${tag.mediaCount} media item(s).\n\n` +
          `Deleting will detach it from all of them (the media stays; only the tag is removed).\n\nContinue?`
      );
      if (!ok) return;
      detach = true;
    } else {
      const ok = confirm(`Delete tag "${tag.label}" forever?\n\nThis cannot be undone.`);
      if (!ok) return;
    }

    setFeedback({ type: "info", text: `Deleting tag "${tag.label}"…` });

    try {
      await deleteTagRequest(tag.id, detach);
      setItems((prev) => prev.filter((t) => t.id !== tag.id));
      setFeedback({ type: "ok", text: "✅ Tag deleted." });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
    }
  }

  function onReorder(activeId: string, overId: string) {
    if (actionBusy) return;

    const oldIndex = ordered.findIndex((t) => t.id === activeId);
    const newIndex = ordered.findIndex((t) => t.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = arrayMove(ordered, oldIndex, newIndex).map((t, idx) => ({ ...t, order: idx }));
    setItems(moved);
  }

  async function saveOrder() {
    if (actionBusy) return;

    setSavingOrder(true);
    setFeedback({ type: "info", text: "Saving tag order…" });

    try {
      await Promise.all(ordered.map((t, idx) => patchTag(t.id, { order: idx })));
      await refresh();
      setFeedback({ type: "ok", text: "✅ Order saved." });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div>
      <TagsToolbar savingOrder={savingOrder} onSaveOrder={saveOrder} />

      <AdminActionFeedback feedback={feedback} />

      <TagFormCard draft={draft} setDraft={setDraft} onCreate={createTag} creating={creating} />

      {ordered.length > 0 && (
        <div className="mt-6 flex items-center gap-2.5 text-sm text-muted-foreground">
          <BulkCheckbox
            checked={selection.allSelected}
            indeterminate={selection.count > 0 && !selection.allSelected}
            onChange={selection.toggleAll}
            label="Select all tags"
          />
          Select all
        </div>
      )}

      <TagsTable
        ordered={ordered}
        isSelected={selection.isSelected}
        onToggleSelect={selection.toggle}
        onReorder={onReorder}
        onEdit={editTag}
        onToggle={toggleTag}
        onDelete={deleteTag}
      />

      <BulkActionBar
        count={selection.count}
        busy={bulkBusy}
        onClear={selection.clear}
        actions={[
          { label: "Activate", onRun: () => bulkSetActive(true) },
          { label: "Deactivate", onRun: () => bulkSetActive(false) },
          { label: "Delete", tone: "danger", onRun: bulkDelete },
        ]}
      />

      <div className="mt-6">
        <button
          type="button"
          disabled={actionBusy}
          onClick={() => void refresh()}
          className={adminButtonClasses("default", "md")}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
