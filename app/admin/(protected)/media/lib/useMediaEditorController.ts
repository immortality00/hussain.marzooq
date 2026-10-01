"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { useAdminSlice } from "@/hooks/useAdminData";
import { cleanupUploadedAsset } from "@/lib/client/cleanup-uploaded-asset";
import { useMediaUsageDialog } from "@/components/admin/media-usage/useMediaUsageDialog";
import { fetchMediaItem, buildMediaPayload } from "./editor-actions";
import { deleteWithUsageCheck, saveWithUsageCheck } from "./media-usage-flows";
import { useMediaEditorState } from "./editor-state";
import { withSavedMedia, withoutMedia } from "./media-store";
import { forgetFoundMedia, keepFoundMedia } from "./found-media";
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
}: {
  initialItem: MediaItem | null;
  loadError: string | null;
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

      const result = await saveWithUsageCheck(
        { editingId: editor.editingId, payloadBase, payloadWithAsset },
        usage.ask
      );
      if (!result) {
        setBanner(null);
        return;
      }

      if (editor.mode === "embed" && editor.uploaded) {
        cleanupUploadedAsset({ publicId: editor.uploaded.publicId });
      }

      const { saved } = result;
      if (saved) {
        keepFoundMedia({ [saved.listItem.id]: saved.item });
        setMedia((media) => withSavedMedia(media, saved, result.mode === "created"));
      }
      const reloaded = async () => (saved ? (saved.item as MediaItem) : await fetchMediaItem(editor.editingId));

      const posterNote = result.posterMissing ? " — the video thumbnail couldn't be fetched." : "";

      if (result.mode === "created") {
        setBanner({ type: "ok", text: posterNote ? `✅ Media created${posterNote}` : "✅ Media created successfully." });
        editor.resetFields(true, () => setBanner(null));
      } else if (result.pagesNotUpdated.length) {
        setBanner({
          type: "err",
          text: `Media updated, but these places could not be updated: ${result.pagesNotUpdated.join(", ")}.`,
        });
        editor.loadIntoState(await reloaded());
      } else {
        setBanner({ type: "ok", text: posterNote ? `✅ Media updated${posterNote}` : "✅ Media updated successfully." });
        editor.loadIntoState(await reloaded());
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
      forgetFoundMedia([deletedId]);
      setMedia((media) => withoutMedia(media, [deletedId]));
      setBanner({ type: "ok", text: "✅ Media deleted." });
      editor.resetFields(true, () => setBanner(null));
      navigate("/admin/media/list");
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
    busy,
    busyAction,
    banner,
    setBanner,
    usageDialog: usage.dialog,
    navigationCover,
    save,
    remove,
    startNewUpload,
  };
}