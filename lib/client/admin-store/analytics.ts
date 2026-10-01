import type { AnalyticsStats } from "@/lib/server/analytics";
import { ADMIN_ANALYTICS_PATH } from "@/lib/admin-data";
import { emit } from "./state";

export type AnalyticsState = { stats: AnalyticsStats | null; failure: string | null; signedOut: boolean };

const EMPTY: AnalyticsState = { stats: null, failure: null, signedOut: false };

let analytics = EMPTY;
let loading: Promise<void> | null = null;

export const getAdminAnalytics = () => analytics;

export function forgetAnalytics() {
  analytics = EMPTY;
}

async function fetchAnalytics(): Promise<AnalyticsState> {
  try {
    const res = await fetch(ADMIN_ANALYTICS_PATH, { cache: "no-store" });
    if (res.status === 401) return { ...analytics, signedOut: true };
    const body = (await res.json().catch(() => null)) as { ok?: boolean; stats?: AnalyticsStats; error?: string } | null;
    if (res.ok && body?.ok && body.stats) return { stats: body.stats, failure: null, signedOut: false };
    return { ...analytics, failure: body?.error ?? `Could not load analytics (error ${res.status}).` };
  } catch {
    return { ...analytics, failure: "No connection." };
  }
}

export function loadAdminAnalytics(force = false) {
  if (loading) return loading;
  if (analytics.stats && !force) return Promise.resolve();
  loading = fetchAnalytics()
    .then((next) => {
      analytics = next;
      emit();
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}
