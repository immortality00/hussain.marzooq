"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import {
  getAdminData,
  getAdminDataFailure,
  getAdminChanges,
  getAdminPreview,
  getAdminSignedOut,
  setAdminSlice,
  subscribeAdminData,
} from "@/lib/client/admin-store";

export type Update<T> = T | ((previous: T) => T);

export function applyUpdate<T>(update: Update<T>, previous: T): T {
  return typeof update === "function" ? (update as (value: T) => T)(previous) : update;
}

export function useAdminData() {
  return useSyncExternalStore(subscribeAdminData, getAdminData, () => null);
}

export function useAdminPreview() {
  return useSyncExternalStore(subscribeAdminData, getAdminPreview, () => null);
}

const SETTLED = { pending: false, applied: [] };

export function useAdminChanges() {
  return useSyncExternalStore(subscribeAdminData, getAdminChanges, () => SETTLED);
}

export function useAdminSignedOut() {
  return useSyncExternalStore(subscribeAdminData, getAdminSignedOut, () => false);
}

export function useAdminDataFailure() {
  return useSyncExternalStore(subscribeAdminData, getAdminDataFailure, () => null);
}

export function useAdminSlice<K extends keyof AdminSnapshot>(key: K) {
  const value = useSyncExternalStore(
    subscribeAdminData,
    () => getAdminData()?.[key],
    () => undefined
  );
  const set = useCallback(
    (next: AdminSnapshot[K] | ((previous: AdminSnapshot[K]) => AdminSnapshot[K])) => setAdminSlice(key, next),
    [key]
  );
  if (value === undefined) throw new Error(`Admin data "${String(key)}" was read before it loaded.`);
  return [value, set] as const;
}
