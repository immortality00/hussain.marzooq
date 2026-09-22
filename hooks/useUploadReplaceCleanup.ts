import { useEffect, useRef } from "react";
import { cleanupUploadedAsset, type UploadedAssetRef } from "@/lib/client/cleanup-uploaded-asset";

// Tracks uploads made during THIS editing session only — never a doc's original,
// already-saved asset, and never a library pick. Call this once per editing
// session (the component/hook that owns save(), not a child that remounts per
// wizard step — a step remount would wipe tracking of an upload made on an
// earlier step and never delivered on it again).
export function useUploadReplaceCleanup() {
  const tracked = useRef(new Map<string, UploadedAssetRef>());
  const savingRef = useRef(false);

  function track(key: string, asset: UploadedAssetRef) {
    tracked.current.set(key, asset);
  }

  // Replacing or clearing a tracked upload deletes it immediately.
  function releaseIfTracked(key: string | null | undefined) {
    if (!key) return;
    const asset = tracked.current.get(key);
    if (!asset) return;
    tracked.current.delete(key);
    cleanupUploadedAsset(asset);
  }

  // Call after a successful save — the doc now legitimately owns this asset, so
  // it must stop being treated as an orphan-in-waiting by releaseAll() below.
  function forget(key: string | null | undefined) {
    if (!key) return;
    tracked.current.delete(key);
  }

  function releaseAll() {
    for (const asset of tracked.current.values()) cleanupUploadedAsset(asset);
    tracked.current.clear();
  }

  // Wrap a save() call in this so the abandon-sweep below can't race it — without
  // it, navigating away in the narrow window between "upload finished" and "the
  // save request lands" would delete the asset the in-flight save still needs.
  async function suspendDuringSave<T>(run: () => Promise<T>): Promise<T> {
    savingRef.current = true;
    try {
      return await run();
    } finally {
      savingRef.current = false;
    }
  }

  // Cleans up whatever is still tracked when the owning component truly unmounts
  // (navigated to a different admin page) or the tab is closed/refreshed — the
  // two abandonment paths no explicit UI action (replace, clear, cancel) can see.
  useEffect(() => {
    function onBeforeUnload() {
      if (savingRef.current) return;
      releaseAll();
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (!savingRef.current) releaseAll();
    };
  }, []);

  return { track, releaseIfTracked, forget, releaseAll, suspendDuringSave };
}
