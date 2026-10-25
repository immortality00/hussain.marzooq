import type { UploadRun } from "@/components/shared/upload/CloudinaryMultiUploadButton";

export function batchReadyText(count: number, run: UploadRun | null): string | null {
  if (count === 0) return null;
  const allReady = run === null || (run.finished && run.failed === 0);
  return allReady ? "All ready" : `${count} item${count > 1 ? "s" : ""} ready`;
}
