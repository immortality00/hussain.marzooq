"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * A single remembered choice (a view mode, a tab) backed by localStorage.
 *
 * Reads through useSyncExternalStore so the server snapshot is always the
 * fallback and React reconciles the stored value after hydration — no
 * setState-in-effect, no hydration mismatch.
 */
export function usePersistedChoice<T extends string>(
  key: string,
  fallback: T,
  isValid: (value: string) => value is T
) {
  const getSnapshot = useCallback(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored && isValid(stored) ? stored : fallback;
    } catch {
      return fallback;
    }
  }, [key, fallback, isValid]);

  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);

  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, next);
      } catch {
        // A blocked storage API must not break the switcher.
      }

      for (const listener of listeners) listener();
    },
    [key]
  );

  return [value, setValue] as const;
}
