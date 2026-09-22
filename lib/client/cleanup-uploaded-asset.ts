export type UploadedAssetRef = {
  url?: string;
  publicId?: string;
  resourceType?: string;
};

// Fire-and-forget: a failed cleanup just leaves the same orphan that existed before
// this existed, never blocks the UI or surfaces an error the admin can't act on.
export function cleanupUploadedAsset(asset: UploadedAssetRef) {
  void fetch("/api/admin/uploads/cleanup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  }).catch(() => {});
}
