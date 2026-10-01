import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

export type AdminSlice = Exclude<keyof AdminSnapshot, "build">;

export const state = {
  data: null as AdminSnapshot | null,
  version: null as string | null,
  failure: null as string | null,
  signedOut: false,
  generation: 0,
};

const listeners = new Set<() => void>();

export function emit() {
  for (const listener of listeners) listener();
}

export function subscribeAdminData(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getAdminData = () => state.data;
export const getAdminDataFailure = () => state.failure;
export const getAdminSignedOut = () => state.signedOut;
export const getAdminDataGeneration = () => state.generation;
