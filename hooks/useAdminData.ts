"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import {
  getAdminData,
  getAdminDataFailure,
  getAdminDataGeneration,
  getAdminChanges,
  getAdminPreview,
  getAdminSignedOut,
  setAdminSlice,
  subscribeAdminData,
  type AdminChanges,
  type AdminSlice,
  type SliceUpdate,
} from "@/lib/client/admin-store";

export function useAdminData() {
  return useSyncExternalStore(subscribeAdminData, getAdminData, () => null);
}

export function useAdminPreview() {
  return useSyncExternalStore(subscribeAdminData, getAdminPreview, () => null);
}

const SETTLED: AdminChanges = { pending: [] };

export function useAdminChanges() {
  return useSyncExternalStore(subscribeAdminData, getAdminChanges, () => SETTLED);
}

export function useAdminSignedOut() {
  return useSyncExternalStore(subscribeAdminData, getAdminSignedOut, () => false);
}

export function useAdminDataFailure() {
  return useSyncExternalStore(subscribeAdminData, getAdminDataFailure, () => null);
}

export function useOnAdminDataChange(callback: () => void) {
  const generation = useSyncExternalStore(subscribeAdminData, getAdminDataGeneration, () => 0);
  const seen = useRef(generation);
  const latest = useRef(callback);
  useEffect(() => {
    latest.current = callback;
  });
  useEffect(() => {
    if (generation === seen.current) return;
    seen.current = generation;
    latest.current();
  }, [generation]);
}

export function useAdminSlice<K extends AdminSlice>(key: K) {
  const value = useSyncExternalStore(
    subscribeAdminData,
    () => getAdminData()?.[key],
    () => undefined
  );
  const set = useCallback(
    (next: SliceUpdate<AdminSnapshot[K]>) => setAdminSlice(key, next),
    [key]
  );
  if (value === undefined) throw new Error(`Admin data "${String(key)}" was read before it loaded.`);
  return [value, set] as const;
}
