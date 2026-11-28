"use client";

import { PullToRefresh } from "@/components/shared/pull-refresh/PullToRefresh";
import { usePageRefresh } from "@/hooks/usePageRefresh";

/** The site's pull to refresh, in every browser and its Home Screen app: the navbar and the page come down (data-pull-moves). */
export function SitePullToRefresh({ fullPageLoads = false }: { fullPageLoads?: boolean }) {
  return <PullToRefresh refresh={usePageRefresh(fullPageLoads)} />;
}
