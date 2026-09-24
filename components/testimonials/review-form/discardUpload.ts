export function discardUpload(url: string) {
  if (!url) return;
  void fetch("/api/testimonials/upload-session/discard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ url }),
  }).catch(() => {});
}
