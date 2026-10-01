import type { AdminSlice } from "./state";

export type AdminChanges = { pending: readonly AdminSlice[] };

const SETTLED: AdminChanges = { pending: [] };

let changes = SETTLED;
let lastWriteAt = 0;

export const getAdminChanges = () => changes;

export function screenHeld(current: AdminChanges, reads?: readonly AdminSlice[]) {
  if (current.pending.length === 0) return false;
  return reads ? reads.some((key) => current.pending.includes(key)) : true;
}

export function noteWrite(touches: readonly AdminSlice[]) {
  lastWriteAt = Date.now();
  const added = touches.filter((key) => !changes.pending.includes(key));
  if (added.length) changes = { pending: [...changes.pending, ...added] };
}

export function noteApplied(key: AdminSlice) {
  if (changes.pending.includes(key)) changes = { pending: changes.pending.filter((k) => k !== key) };
}

export function writtenSince(startedAt: number) {
  return startedAt < lastWriteAt;
}

export function settleChanges() {
  if (changes === SETTLED) return false;
  changes = SETTLED;
  return true;
}
