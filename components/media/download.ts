export function toCloudinaryAttachmentUrl(url: string) {
  if (url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/fl_attachment/");
  }

  return url;
}

export function downloadCloudinaryFile(url: string) {
  const link = document.createElement("a");
  link.href = toCloudinaryAttachmentUrl(url);
  link.target = "_blank";
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}