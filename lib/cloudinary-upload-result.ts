/**
 * Cloudinary can answer an upload with 200 and a *placeholder* asset — a record
 * carrying `bytes: 0` and `placeholder: true` when the file never finished landing.
 * Accepting one creates a media document whose every delivery URL 404s, which is
 * how three of the library's items ended up permanently broken. Reject it at the
 * uploader so a failed upload can never become a document.
 */

export type CloudinaryUploadResponse = {
  secure_url?: unknown;
  public_id?: unknown;
  resource_type?: unknown;
  bytes?: unknown;
  placeholder?: unknown;
};

export function uploadResultError(data: CloudinaryUploadResponse | null | undefined): string | null {
  if (!data) return "Upload did not complete.";

  const hasFields =
    typeof data.secure_url === "string" &&
    data.secure_url.length > 0 &&
    typeof data.public_id === "string" &&
    data.public_id.length > 0 &&
    typeof data.resource_type === "string" &&
    data.resource_type.length > 0;

  if (!hasFields) return "Upload did not complete.";

  if (data.placeholder === true || data.bytes === 0) {
    return "Cloudinary stored an empty file — the upload did not finish. Try again.";
  }

  return null;
}
