export type UploadedAssetRef = {
  url?: string;
  publicId?: string;
  resourceType?: string;
};

// Fire-and-forget: a failed cleanup just leaves the same orphan that existed before
// this existed, never blocks the UI or surfaces an error the admin can't act on.
// `keepalive` lets the request survive a navigation/tab-close that fires in the same
// tick (the beforeunload sweep in useUploadReplaceCleanup depends on this).
export function cleanupUploadedAsset(asset: UploadedAssetRef) {
  void fetch("/api/admin/uploads/cleanup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify(asset),
  }).catch(() => {});
}
