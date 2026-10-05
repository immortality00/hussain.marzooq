export type UploadFailure = { name: string; reason: string };

export function uploadFailureMessage(total: number, failures: readonly UploadFailure[]): string | null {
  if (failures.length === 0) return null;

  const byReason = new Map<string, string[]>();
  for (const { name, reason } of failures) byReason.set(reason, [...(byReason.get(reason) ?? []), name]);
  const reasons = [...byReason].map(([reason, names]) => `${names.join(", ")}: ${reason}`).join(" · ");

  if (failures.length < total) return `${failures.length} of ${total} files did not upload. ${reasons}`;
  return total === 1 ? reasons : `None of the ${total} files uploaded. ${reasons}`;
}
