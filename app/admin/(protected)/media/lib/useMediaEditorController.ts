"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminActionFeedbackState } from "@/components/admin/action-feedback/AdminActionFeedback";
import {
  deleteMediaItem,
  fetchMediaItem,
  buildMediaPayload,
  saveMediaItem,
} from "./editor-actions";
import { useMediaEditorState } from "./editor-state";
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

export function useMediaEditorController() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const editId = (searchParams.get("edit") ?? "").trim();
  const prefillCategory = (searchParams.get("category") ?? "").trim() as MediaCategory;

  const editor = useMediaEditorState();
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [banner, setBanner] = useState<AdminActionFeedbackState>(null);

  const busy = busyAction !== null;
  const setPrimaryCategoryRef = useRef(editor.setPrimaryCategory);
  const loadIntoStateRef = useRef(editor.loadIntoState);

  useEffect(() => {
    setPrimaryCategoryRef.current = editor.setPrimaryCategory;
    loadIntoStateRef.current = editor.loadIntoState;
  }, [editor.setPrimaryCategory, editor.loadIntoState]);

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

  useEffect(() => {
    if (!editId) return;

    let cancelled = false;

    async function run() {
      setBanner(null);
      setBusyAction("load");

      try {
        const item: MediaItem = await fetchMediaItem(editId);
        if (!cancelled) {
          loadIntoStateRef.current(item);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setBanner({
            type: "err",
            text: e instanceof Error ? e.message : "Failed to load media.",
          });
        }
      } finally {
        if (!cancelled) setBusyAction(null);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [editId]);

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

      const result = await saveMediaItem({
        editingId: editor.editingId,
        payloadBase,
        payloadWithAsset,
      });

      if (result.mode === "created") {
        setBanner({ type: "ok", text: "✅ Media created successfully." });
        editor.resetFields(true, () => setBanner(null));
      } else {
        setBanner({ type: "ok", text: "✅ Media updated successfully." });
        const reloaded = await fetchMediaItem(editor.editingId);
        editor.loadIntoState(reloaded);
        router.refresh();
      }
    } catch (e: unknown) {
      setBanner({
        type: "err",
        text: e instanceof Error ? e.message : "Save failed.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function remove() {
    if (!editor.editingId || busyAction === "delete") return;

    const ok = confirm("Delete this media forever? This cannot be undone.");
    if (!ok) return;

    setBusyAction("delete");
    setBanner({ type: "info", text: "Deleting media and cleaning Cloudinary asset…" });

    try {
      await deleteMediaItem(editor.editingId);
      setBanner({ type: "ok", text: "✅ Media deleted." });
      editor.resetFields(true, () => setBanner(null));
      router.push("/admin/media/list");
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
    router.push("/admin/media");
  }

  return {
    editId,
    prefillCategory,
    editor,
    busy,
    busyAction,
    banner,
    setBanner,
    save,
    remove,
    startNewUpload,
  };
}