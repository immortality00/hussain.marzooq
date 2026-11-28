"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * The site's pull to refresh: the page again from the server without a reload (router.refresh keeps the
 * scroll, the homepage film and what is on screen), resolving once the new page is in. Offline it leaves
 * the page and says so; on the global 404, which Next can't refresh in place (SEC6), it reloads.
 */
export function usePageRefresh(fullPageLoads: boolean) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const settle = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (pending || !settle.current) return;
    settle.current();
    settle.current = null;
  }, [pending]);

  return useCallback(async (): Promise<string | null> => {
    if (!navigator.onLine) return "No connection.";
    if (fullPageLoads) {
      location.reload();
      return null;
    }
    await new Promise<void>((resolve) => {
      settle.current = resolve;
      startTransition(() => router.refresh());
    });
    return null;
  }, [fullPageLoads, router]);
}
