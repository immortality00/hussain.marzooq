export type UploadedAssetRef = {
  url?: string;
  publicId?: string;
};

export function cleanupUploadedAsset(asset: UploadedAssetRef) {
  void fetch("/api/admin/uploads/cleanup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify(asset),
  }).catch(() => {});
}
