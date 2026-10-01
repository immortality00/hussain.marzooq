export const RECORD_CHANGED = "RECORD_CHANGED";
export const EXPECTED_VERSION_HEADER = "x-hm-expected-version";

export function expectVersion(version: string | null | undefined): Record<string, string> {
  return version === undefined ? {} : { [EXPECTED_VERSION_HEADER]: version ?? "" };
}

export class RecordChangedError<T = unknown> extends Error {
  constructor(readonly current: T) {
    super("This was changed on another device since you opened it.");
  }
}

export function throwIfRecordChanged(data: unknown) {
  if (data && typeof data === "object" && (data as { code?: unknown }).code === RECORD_CHANGED) {
    throw new RecordChangedError((data as { current?: unknown }).current ?? null);
  }
}

export type RecordChangedAnswer = "reload" | "overwrite" | "cancel";

export async function saveGuarded<T, C>(
  expected: string | null | undefined,
  save: (expected: string | null | undefined) => Promise<T>,
  ask: () => Promise<RecordChangedAnswer>,
  versionOf: (current: C) => string | null,
  reload: (current: C) => void
): Promise<T | null> {
  try {
    return await save(expected);
  } catch (error) {
    if (!(error instanceof RecordChangedError)) throw error;
    const current = error.current as C;
    const answer = await ask();
    if (answer === "reload") reload(current);
    if (answer !== "overwrite") return null;
    return saveGuarded(versionOf(current), save, ask, versionOf, reload);
  }
}
