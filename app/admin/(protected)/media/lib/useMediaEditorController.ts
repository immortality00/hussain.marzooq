"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { useAdminSlice } from "@/hooks/useAdminData";
import { cleanupUploadedAsset } from "@/lib/client/cleanup-uploaded-asset";
import { useMediaUsageDialog } from "@/components/admin/media-usage/useMediaUsageDialog";
import { useRecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { saveGuarded } from "@/lib/record-changed";
import { buildMediaPayload } from "./editor-actions";
import { deleteWithUsageCheck, saveWithUsageCheck } from "./media-usage-flows";
import { useMediaEditorState } from "./editor-state";
import { withSavedMedia, withoutMedia, type SavedMedia } from "./media-store";
import { removeFromPageSets, replaceInPageSets } from "./media-page-sets";
import { editorValuesKey, editorValuesOf, itemValuesKey } from "./media-fingerprint";
import type { MediaCategory, MediaItem } from "./types";
import { findFirstAppearanceError } from "./utils";

const allowedCategories: MediaCategory[] = [
  "photography",
  "videography",
  "showreel",
  "nft",
  "art",
];

type BusyAction = "load" | "save" | "delete" | null;

export function useMediaEditorController({
  initialItem,
  loadError,
  onDeleted,
}: {
  initialItem: MediaItem | null;
  loadError: string | null;
  // After a delete: the editor goes back to the list (the caller knows which row takes the deleted one's place).
  onDeleted: (id: string) => void;
}) {
  const searchParams = useSearchParams();
  const { navigate, navigationCover } = useAdminNavigate();
  const [, setMedia] = useAdminSlice("media");

  const editId = (searchParams.get("edit") ?? "").trim();
  const prefillCategory = (searchParams.get("category") ?? "").trim() as MediaCategory;

  const editor = useMediaEditorState(initialItem);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const { feedback: banner, setFeedback: setBanner } = useAdminAction({
    initial: loadError ? { type: "err", text: loadError } : null,
  });
  const usage = useMediaUsageDialog(() => setBanner(null));
  const changed = useRecordChangedDialog(() => setBanner(null));
  const [version, setVersion] = useState<string | null>(initialItem?.updatedAt ?? null);
  const [savedValues, setSavedValues] = useState(() => (initialItem ? itemValuesKey(initialItem) : null));
  const dirty =
    Boolean(editor.editingId) && savedValues !== null && editorValuesKey(editorValuesOf(editor)) !== savedValues;

  function load(item: MediaItem) {
    editor.loadIntoState(item);
    setSavedValues(itemValuesKey(item));
  }

  function keepSaved(saved: SavedMedia, created: boolean) {
    setMedia((media) => withSavedMedia(media, saved, created));
    replaceInPageSets(saved.listItem, saved.item);
  }

  const busy = busyAction !== null;
  const setPrimaryCategoryRef = useRef(editor.setPrimaryCategory);

  useEffect(() => {
    setPrimaryCategoryRef.current = editor.setPrimaryCategory;
  }, [editor.setPrimaryCategory]);

  useEffect(() => {
    if (
      !editId &&
      prefillCategory &&
      editor.categories.length === 0 &&
      allowedCategories.includes(prefillCategory)
    ) {
      setPrimaryCategoryRef.current(prefillCategory);
    }
  }, [editId, prefillCategory, editor.categories.length]);

  async function save() {
    if (busyAction === "save") return;

    setBanner(null);

    if (!editor.title.trim()) {
      setBanner({ type: "err", text: "Title is required." });
      return;
    }

    if (editor.categories.length === 0) {
      setBanner({ type: "err", text: "Choose a category first." });
      return;
    }

    const appearanceError = findFirstAppearanceError(editor.appearances);
    if (appearanceError) {
      const label = appearanceError.kind === "exhibited" ? "Exhibition" : "Feature";
      setBanner({
        type: "err",
        text: `${label} #${appearanceError.index + 1}: ${appearanceError.message}`,
      });
      return;
    }

    const isEditing = Boolean(editor.editingId);

    setBusyAction("save");
    setBanner({
      type: "info",
      text: isEditing ? "Updating media…" : "Creating media…",
    });

    try {
      await doSave();
    } finally {
      setBusyAction(null);
    }
  }

  async function doSave() {
    try {
      const { payloadBase, payloadWithAsset } = buildMediaPayload({
        editingId: editor.editingId,
        mode: editor.mode,
        title: editor.title,
        description: editor.description,
        location: editor.location,
        locationId: editor.locationId,
        locationLat: editor.locationLat,
        locationLon: editor.locationLon,
        locationCountryCode: editor.locationCountryCode,
        event: editor.event,
        year: editor.year,
        tags: editor.tags,
        categories: editor.categories,
        peopleIds: editor.peopleIds,
        isPublic: editor.isPublic,
        schedule: editor.schedule,
        appearances: editor.appearances,
        embedUrl: editor.embedUrl,
        uploaded: editor.uploaded,
        nftPrice: editor.nftPrice,
        nftCurrency: editor.nftCurrency,
        nftEditionType: editor.nftEditionType,
        nftEditionsTotal: editor.nftEditionsTotal,
        nftEditionsRemaining: editor.nftEditionsRemaining,
        nftOpenUntil: editor.nftOpenUntil,
        nftStatus: editor.nftStatus,
        nftMarketplaceUrl: editor.nftMarketplaceUrl,
      });

      const result = await saveGuarded(
        editor.editingId ? version : undefined,
        (expected) => saveWithUsageCheck({ editingId: editor.editingId, payloadBase, payloadWithAsset, expected }, usage.ask),
        changed.ask,
        (current: SavedMedia) => current.item.updatedAt,
        (current: SavedMedia) => {
          keepSaved(current, false);
          load(current.item as MediaItem);
          setVersion(current.item.updatedAt);
        }
      );
      if (!result) {
        setBanner(null);
        return;
      }

      if (editor.mode === "embed" && editor.uploaded) {
        cleanupUploadedAsset({ publicId: editor.uploaded.publicId });
      }

      const { saved } = result;
      if (!saved) throw new Error("The server did not return the saved media.");
      keepSaved(saved, result.mode === "created");
      setVersion(saved.item.updatedAt);

      const posterNote = result.posterMissing ? " — the video thumbnail couldn't be fetched." : "";
      const draftNote =
        result.mode === "created" && result.draftError ? `Blog draft not made: ${result.draftError}` : "";

      if (result.deliveryError || draftNote) {
        setBanner({
          type: "err",
          text: [`Media ${result.mode === "created" ? "created" : "updated"}.`, result.deliveryError, draftNote]
            .filter(Boolean)
            .join(" "),
        });
        if (result.mode === "created") editor.resetFields(true, () => setBanner(null));
        else load(saved.item as MediaItem);
      } else if (result.mode === "created") {
        setBanner({ type: "ok", text: posterNote ? `✅ Media created${posterNote}` : "✅ Media created successfully." });
        editor.resetFields(true, () => setBanner(null));
      } else if (result.pagesNotUpdated.length) {
        setBanner({
          type: "err",
          text: `Media updated, but these places could not be updated: ${result.pagesNotUpdated.join(", ")}.`,
        });
        load(saved.item as MediaItem);
      } else {
        setBanner({ type: "ok", text: posterNote ? `✅ Media updated${posterNote}` : "✅ Media updated successfully." });
        load(saved.item as MediaItem);
      }
    } catch (e: unknown) {
      setBanner({
        type: "err",
        text: e instanceof Error ? e.message : "Save failed.",
      });
    }
  }

  async function remove() {
    if (!editor.editingId || busyAction === "delete") return;

    const ok = confirm("Delete this media forever? This cannot be undone.");
    if (!ok) return;

    setBusyAction("delete");
    setBanner({ type: "info", text: "Deleting media and cleaning Cloudinary asset…" });

    try {
      if (!(await deleteWithUsageCheck(editor.editingId, usage.ask))) {
        setBanner(null);
        return;
      }
      const deletedId = editor.editingId;
      setMedia((media) => withoutMedia(media, [deletedId]));
      removeFromPageSets([deletedId]);
      setBanner({ type: "ok", text: "✅ Media deleted." });
      onDeleted(deletedId);
    } catch (e: unknown) {
      setBanner({
        type: "err",
        text: e instanceof Error ? e.message : "Delete failed.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  function startNewUpload() {
    if (busy) return;
    editor.resetFields(false, () => setBanner(null));
    navigate("/admin/media");
  }

  return {
    editId,
    prefillCategory,
    editor,
    dirty,
    busy,
    busyAction,
    banner,
    setBanner,
    usageDialog: usage.dialog,
    changedDialog: changed.dialog,
    navigationCover,
    save,
    remove,
    startNewUpload,
  };
}