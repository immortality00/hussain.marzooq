"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { countedPath } from "@/lib/analytics-path";

type GoatCounter = {
  count?: (vars: { path: string; referrer: string }) => void;
};

// The new page's title arrives a moment after the page (Next.js sends it separately); count
// once it has, or after this long.
export const TITLE_WAIT_MS = 1500;

function goatcounter(): GoatCounter | undefined {
  return (window as unknown as { goatcounter?: GoatCounter }).goatcounter;
}

// count.js counts the page a visit starts on, once, when it loads. The site moves between
// its own pages without loading a new document, so each later page is counted here — with
// its own title, and without the outside referrer, which belongs to the first page only
// (sent again, one visit from a search engine would read as several). The path is cut like
// count.js's own (gallery keys).
export function AnalyticsPageviews() {
  const pathname = usePathname();
  const counted = useRef<string | null>(null);
  const countedTitle = useRef("");

  useEffect(() => {
    if (counted.current === null) {
      counted.current = pathname;
      countedTitle.current = document.title;
      return;
    }
    if (counted.current === pathname) return;
    counted.current = pathname;

    const previousTitle = countedTitle.current;
    const path = countedPath(pathname);
    let sent = false;
    // `titleIsThisPage` is false when the page is left before its title arrived: the title
    // showing then may already be the next page's, so it is not kept as this page's.
    const send = (titleIsThisPage: boolean) => {
      if (sent) return;
      sent = true;
      observer.disconnect();
      window.clearTimeout(timer);
      if (titleIsThisPage) countedTitle.current = document.title;
      goatcounter()?.count?.({ path, referrer: "" });
    };
    const titled = () => document.title !== "" && document.title !== previousTitle;

    const observer = new MutationObserver(() => {
      if (titled()) send(true);
    });
    const timer = window.setTimeout(() => send(true), TITLE_WAIT_MS);
    if (titled()) send(true);
    else observer.observe(document.head, { childList: true, subtree: true, characterData: true });

    // Leaving before the title arrived still counts the page.
    return () => send(false);
  }, [pathname]);

  return null;
}
