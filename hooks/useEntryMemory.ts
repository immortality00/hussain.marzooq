"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { recallForEntry, rememberForEntry } from "@/lib/client/entry-memory";

// `restored` is what this visit to the page had when it was left, read once as the page
// mounts (nothing on a first visit, and nothing during hydration: the memory starts empty).
// Call `remember` whenever that state changes.
export function useEntryMemory<T>(name: string) {
  const scope = `${name}:${usePathname()}`;
  const [restored] = useState(() => recallForEntry<T>(scope));
  const remember = useCallback((value: T) => rememberForEntry(scope, value), [scope]);
  return { restored, remember };
}
