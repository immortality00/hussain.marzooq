import { useRef } from "react";
import { cleanupUploadedAsset, type UploadedAssetRef } from "@/lib/client/cleanup-uploaded-asset";

// Tracks uploads made during THIS editing session only — never a doc's original,
// already-saved asset, and never a library pick. Replacing or clearing a tracked
// upload deletes it immediately; a save-time PATCH still handles the original
// asset, since that one was never added here.
export function useUploadReplaceCleanup() {
  const tracked = useRef(new Map<string, UploadedAssetRef>());

  function track(key: string, asset: UploadedAssetRef) {
    tracked.current.set(key, asset);
  }

  function releaseIfTracked(key: string | null | undefined) {
    if (!key) return;
    const asset = tracked.current.get(key);
    if (!asset) return;
    tracked.current.delete(key);
    cleanupUploadedAsset(asset);
  }

  return { track, releaseIfTracked };
}
