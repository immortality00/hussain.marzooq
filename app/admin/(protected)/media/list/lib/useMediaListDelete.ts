"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import type { AdminActionFeedbackState } from "@/components/admin/action-feedback/AdminActionFeedback";
import { runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import {
  useMediaUsageDialog,
  type MediaUsageOption,
} from "@/components/admin/media-usage/useMediaUsageDialog";
import { fetchMediaUsages } from "@/lib/client/media-usage-api";
import { deleteMediaItem } from "../../lib/editor-actions";
import { deleteWithUsageCheck, REMOVE_AND_DELETE } from "../../lib/media-usage-flows";
import type { MediaItem } from "../components/MediaListItem";

type Selection = { selectedIds: string[]; count: number; deselect: (ids: string[]) => void };

function errorText(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

export function useMediaListDelete({
  items,
  setItems,
  selection,
  setBanner,
}: {
  items: MediaItem[];
  setItems: Dispatch<SetStateAction<MediaItem[]>>;
  selection: Selection;
  setBanner: (feedback: AdminActionFeedbackState) => void;
}) {
  const usage = useMediaUsageDialog(() => setBanner(null));
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  async function del(id: string) {
    if (deletingId) return;
    if (!confirm("Delete this media forever? This cannot be undone.")) return;
    setDeletingId(id);
    setBanner({ type: "info", text: "Deleting media and cleaning Cloudinary asset…" });
    try {
      if (!(await deleteWithUsageCheck(id, usage.ask))) {
        setBanner(null);
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== id));
      setBanner({ type: "ok", text: "✅ Media deleted." });
    } catch (e: unknown) {
      setBanner({ type: "err", text: errorText(e, "Delete failed.") });
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
    if (!confirm(`Delete ${selection.count} media item(s) forever? This cannot be undone.`)) return;
    setBulkBusy(true);
    setBanner({ type: "info", text: "Checking where the selected media is used…" });
    try {
      const plan = await chooseTargets(selection.selectedIds);
      if (!plan || plan.targets.length === 0) {
        setBanner(null);
        return;
      }
      setBanner({ type: "info", text: "Deleting selected media…" });
      const { ok, okIds, failures } = await runBulkAction(plan.targets, (id) =>
        deleteMediaItem(id, plan.removeFromPages.has(id))
      );
      setItems((prev) => prev.filter((x) => !okIds.includes(x.id)));
      const titleOf = (id: string) => items.find((item) => item.id === id)?.title || "Untitled";
      const reasons = failures.map((f) => `“${titleOf(f.id)}”: ${f.message || "Delete failed."}`);
      setBanner({
        type: failures.length ? "err" : "ok",
        text: [`${ok} deleted${failures.length ? `, ${failures.length} failed` : ""}.`, ...reasons].join(" "),
      });
    } catch (e: unknown) {
      setBanner({ type: "err", text: errorText(e, "Delete failed.") });
    } finally {
      setBulkBusy(false);
    }
  }

  return { del, bulkDelete, deletingId, bulkBusy, usageDialog: usage.dialog };
}
