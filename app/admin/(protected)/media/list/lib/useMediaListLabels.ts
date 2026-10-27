"use client";

import { useState } from "react";
import type { AdminActionFeedbackState } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useMediaUsageDialog } from "@/components/admin/media-usage/useMediaUsageDialog";
import { useRecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { errorMessage } from "@/hooks/useAdminAction";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { saveGuarded } from "@/lib/record-changed";
import type { SavedMedia } from "../../lib/media-store";
import type { MediaItem } from "../components/MediaListItem";
import { saveMediaLabels, type LabelChange } from "./save-media-labels";

export type LabelLine = "people" | "tags";

type Labels = { tags: string[]; peopleIds: string[]; people: string[] };
type Draft = Labels & { id: string; line: LabelLine; base: string | null; original: Labels };

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((value, i) => value === b[i]);

function isDirty(draft: Draft | null) {
  if (!draft) return false;
  if (draft.line === "tags") return !sameList(draft.tags, draft.original.tags);
  return !sameList(draft.peopleIds, draft.original.peopleIds) || !sameList(draft.people, draft.original.people);
}

// One line of one row is edited at a time; the version it was opened with is the one sent.
export function useMediaListLabels({
  replaceItem,
  setBanner,
}: {
  replaceItem: (saved: SavedMedia) => void;
  setBanner: (feedback: AdminActionFeedbackState) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const usage = useMediaUsageDialog(() => setBanner(null));
  const changed = useRecordChangedDialog(() => setBanner(null));
  const dirty = isDirty(draft);
  useUnsavedChangesGuard(dirty);

  function open(item: MediaItem, line: LabelLine) {
    const labels = { tags: item.tags, peopleIds: item.peopleIds, people: item.people };
    setDraft({ ...labels, id: item.id, line, base: item.updatedAt, original: labels });
  }

  function update(next: (current: Draft) => Partial<Labels>) {
    setDraft((current) => (current ? { ...current, ...next(current) } : current));
  }

  async function save() {
    if (!draft || busy) return;
    const what = draft.line === "tags" ? "Tags" : "People";
    const change: LabelChange = draft.line === "tags" ? { tags: draft.tags } : { peopleIds: draft.peopleIds };
    let reloaded = false;

    setBusy(true);
    try {
      const result = await saveGuarded(
        draft.base,
        (expected) => saveMediaLabels(draft.id, change, expected, usage.ask),
        changed.ask,
        (current: SavedMedia) => current.listItem.updatedAt,
        (current: SavedMedia) => {
          reloaded = true;
          replaceItem(current);
        }
      );
      if (result) {
        replaceItem(result.saved);
        setDraft(null);
        setBanner(
          result.deliveryError
            ? { type: "err", text: `${what} saved. ${result.deliveryError}` }
            : { type: "ok", text: `${what} saved.` }
        );
      } else if (reloaded) {
        setDraft(null);
      }
    } catch (e: unknown) {
      setBanner({ type: "err", text: `${what} not saved: ${errorMessage(e, "Save failed.")}` });
    } finally {
      setBusy(false);
    }
  }

  return {
    draft,
    busy,
    dirty,
    open,
    cancel: () => setDraft(null),
    addTag: (slug: string) =>
      update((current) => ({ tags: current.tags.includes(slug) ? current.tags : [...current.tags, slug] })),
    removeTag: (slug: string) => update((current) => ({ tags: current.tags.filter((tag) => tag !== slug) })),
    setPeople: (next: { ids: string[]; names: string[] }) => update(() => ({ peopleIds: next.ids, people: next.names })),
    save,
    usageDialog: usage.dialog,
    changedDialog: changed.dialog,
  };
}

export type MediaListLabels = ReturnType<typeof useMediaListLabels>;
