"use client";

import { useState } from "react";
import type { AdminActionFeedbackState } from "@/components/admin/action-feedback/AdminActionFeedback";
import { runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { bulkResultText } from "@/components/admin/bulk/bulk-result";
import { deleteQuestion, useConfirmDialog } from "@/components/admin/choice-dialog/ConfirmDialog";
import { errorMessage } from "@/hooks/useAdminAction";
import {
  useMediaUsageDialog,
  type MediaUsageOption,
} from "@/components/admin/media-usage/useMediaUsageDialog";
import { fetchMediaUsages } from "@/lib/client/media-usage-api";
import { countOf } from "@/lib/plural";
import { deleteMediaItem } from "../../lib/editor-actions";
import { deleteWithUsageCheck, REMOVE_AND_DELETE } from "../../lib/media-usage-flows";
import type { MediaItem } from "../components/MediaListItem";

type Selection = { selectedIds: string[]; count: number; deselect: (ids: string[]) => void };

export function useMediaListDelete({
  items,
  removeItems,
  selection,
  setBanner,
}: {
  items: MediaItem[];
  removeItems: (ids: string[]) => void;
  selection: Selection;
  setBanner: (feedback: AdminActionFeedbackState) => void;
}) {
  const usage = useMediaUsageDialog(() => setBanner(null));
  const confirmation = useConfirmDialog(() => setBanner(null));
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const titleOf = (id: string) => items.find((item) => item.id === id)?.title || "Untitled";

  async function del(id: string) {
    if (deletingId) return;
    if (!(await confirmation.ask(deleteQuestion(`“${titleOf(id)}”`)))) return;
    setDeletingId(id);
    setBanner({ type: "info", text: "Deleting media and cleaning Cloudinary asset…" });
    try {
      if (!(await deleteWithUsageCheck(id, usage.ask))) {
        setBanner(null);
        return;
      }
      removeItems([id]);
      setBanner({ type: "ok", text: "Media deleted." });
    } catch (e: unknown) {
      setBanner({ type: "err", text: errorMessage(e, "Delete failed.") });
    } finally {
      setDeletingId(null);
    }
  }

  async function chooseTargets(ids: string[]) {
    const inUse = await fetchMediaUsages(ids);
    if (inUse.length === 0) return { targets: ids, removeFromPages: new Set<string>() };

    const inUseIds = inUse.map((item) => item.id);
    const rest = ids.filter((id) => !inUseIds.includes(id));
    const uncheck: MediaUsageOption = {
      answer: "uncheck",
      label: rest.length ? "Uncheck these and delete the rest" : "Uncheck these",
    };
    const answer = await usage.ask(inUse, [uncheck, REMOVE_AND_DELETE]);

    if (answer === "uncheck") {
      selection.deselect(inUseIds);
      return { targets: rest, removeFromPages: new Set<string>() };
    }
    return answer === "remove" ? { targets: ids, removeFromPages: new Set(inUseIds) } : null;
  }

  async function bulkDelete() {
    if (bulkBusy || selection.count === 0) return;
    if (!(await confirmation.ask(deleteQuestion(countOf(selection.count, "media item"))))) return;
    setBulkBusy(true);
    setBanner({ type: "info", text: "Checking where the selected media is used…" });
    try {
      const plan = await chooseTargets(selection.selectedIds);
      if (!plan || plan.targets.length === 0) {
        setBanner(null);
        return;
      }
      setBanner({ type: "info", text: "Deleting selected media…" });
      const result = await runBulkAction(plan.targets, (id) =>
        deleteMediaItem(id, plan.removeFromPages.has(id))
      );
      removeItems(result.okIds);
      setBanner({
        type: result.failed ? "err" : "ok",
        text: bulkResultText(result, "deleted", titleOf, "Delete failed."),
      });
    } catch (e: unknown) {
      setBanner({ type: "err", text: errorMessage(e, "Delete failed.") });
    } finally {
      setBulkBusy(false);
    }
  }

  return { del, bulkDelete, deletingId, bulkBusy, usageDialog: usage.dialog, confirmDialog: confirmation.dialog };
}
