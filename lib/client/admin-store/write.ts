import { emit, type AdminSlice } from "./state";
import { noteWrite } from "./changes";
import { markAdminDataChanged } from "./fetch";

export async function adminWrite(input: string, init: RequestInit, touches: readonly AdminSlice[]) {
  if (touches.length === 0) return fetch(input, init);
  noteWrite(touches);
  emit();
  try {
    return await fetch(input, init);
  } finally {
    markAdminDataChanged(touches);
  }
}
