"use client";

import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { canGoBackTo } from "@/lib/client/history-entry";

// The way back to an admin list: the browser's own Back when the page before this one was that list — so it
// comes back as it was left, search and place included — otherwise the list's address (`href`).
export function useBackToList(href: string) {
  const { navigate, navigationCover } = useAdminNavigate();

  function goBack() {
    if (canGoBackTo(new URL(href, window.location.href).pathname)) window.history.back();
    else navigate(href);
  }

  return { goBack, navigationCover };
}
