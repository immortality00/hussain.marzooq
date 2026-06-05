"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  deleteMediaItem,
  fetchMediaItem,
  buildMediaPayload,
  saveMediaItem,
} from "./editor-actions";
import { useMediaEditorState } from "./editor-state";
import type { MediaCategory, MediaItem } from "./types";

const allowedCategories: MediaCategory[] = [
  "photography",
  "videography",
  "showreel",
  "nft",
  "art",
];

export function useMediaEditorController() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const editId = (searchParams.get("edit") ?? "").trim();
  const prefillCategory = (searchParams.get("category") ?? "").trim() as MediaCategory;

  const editor = useMediaEditorState();
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
      setBusy(true);
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
        if (!cancelled) setBusy(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  async function save() {
    setBanner(null);

    if (!editor.title.trim()) {
      setBanner({ type: "err", text: "Title is required." });
      return;
    }

    if (editor.categories.length === 0) {
      setBanner({ type: "err", text: "Choose a category first." });
      return;
    }

    setBusy(true);
    try {
      const { payloadBase, payloadWithAsset } = buildMediaPayload({
        editingId: editor.editingId,
        mode: editor.mode,
        title: editor.title,
        description: editor.description,
        location: editor.location,
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
        setBanner({ type: "ok", text: "✅ Media saved successfully." });
        editor.resetFields(true, () => setBanner(null));
      } else {
        setBanner({ type: "ok", text: "✅ Updated successfully." });
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
      setBusy(false);
    }
  }

  async function remove() {
    if (!editor.editingId) return;

    const ok = confirm("Delete this media forever? This cannot be undone.");
    if (!ok) return;

    setBusy(true);
    setBanner(null);
    try {
      await deleteMediaItem(editor.editingId);
      setBanner({ type: "ok", text: "✅ Deleted." });
      editor.resetFields(true, () => setBanner(null));
      router.push("/admin/media/list");
    } catch (e: unknown) {
      setBanner({
        type: "err",
        text: e instanceof Error ? e.message : "Delete failed.",
      });
    } finally {
      setBusy(false);
    }
  }

  function startNewUpload() {
    editor.resetFields(false, () => setBanner(null));
    router.push("/admin/media");
  }

  return {
    editId,
    prefillCategory,
    editor,
    busy,
    banner,
    setBanner,
    save,
    remove,
    startNewUpload,
  };
}